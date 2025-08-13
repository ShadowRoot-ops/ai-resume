// src/app/api/resumes/[id]/download/route.ts
import { NextRequest, NextResponse } from "next/server";

// You'll need a function to fetch resume data from your database
async function getResumeById(id: string) {
  // Replace this with your actual database fetch logic
  const response = await fetch(`${process.env.API_URL}/api/resumes/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch resume");
  }
  return response.json();
}

interface Resume {
  title?: string;
  content?: {
    personalInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      website?: string;
    };
    summary?: string;
    experience?: Array<{
      position?: string;
      company?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      responsibilities?: string[];
    }>;
    education?: Array<{
      degree?: string;
      fieldOfStudy?: string;
      institution?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      gpa?: string;
    }>;
    skills?: string[];
    projects?: Array<{
      name?: string;
      description?: string;
      technologies?: string;
      url?: string;
    }>;
  };
}

function resumeToPlainText(resume: Resume): string {
  // Convert resume data to plain text
  let text = "";

  // Name and contact info
  if (resume.content?.personalInfo) {
    const pi = resume.content.personalInfo;
    text += `${pi.name || ""}${pi.name ? "\n" : ""}`;

    const contactInfo = [
      pi.email,
      pi.phone,
      pi.location,
      pi.linkedin,
      pi.website,
    ]
      .filter(Boolean)
      .join(" | ");

    text += contactInfo ? `${contactInfo}\n\n` : "";
  }

  // Summary
  if (resume.content?.summary) {
    text += "PROFESSIONAL SUMMARY\n";
    text += "==================\n";
    text += `${resume.content.summary}\n\n`;
  }

  // Experience
  if (resume.content?.experience?.length) {
    text += "EXPERIENCE\n";
    text += "==========\n";

    resume.content.experience.forEach(
      (exp: {
        position?: string;
        company?: string;
        location?: string;
        startDate?: string;
        endDate?: string;
        current?: boolean;
        responsibilities?: string[];
      }) => {
        text += `${exp.position || ""}\n`;
        text += `${exp.company || ""}${
          exp.location ? `, ${exp.location}` : ""
        }\n`;

        const dateRange = [
          exp.startDate
            ? new Date(exp.startDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
              })
            : "",
          exp.current
            ? "Present"
            : exp.endDate
            ? new Date(exp.endDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
              })
            : "",
        ]
          .filter(Boolean)
          .join(" - ");

        text += dateRange ? `${dateRange}\n` : "";

        if (exp.responsibilities?.length) {
          exp.responsibilities.forEach((resp: string) => {
            text += `• ${resp}\n`;
          });
        }

        text += "\n";
      }
    );
  }

  // Education
  if (resume.content?.education?.length) {
    text += "EDUCATION\n";
    text += "=========\n";

    resume.content.education.forEach(
      (edu: {
        degree?: string;
        fieldOfStudy?: string;
        institution?: string;
        startDate?: string;
        endDate?: string;
        current?: boolean;
        gpa?: string;
      }) => {
        text += `${edu.degree || ""}${
          edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""
        }\n`;
        text += `${edu.institution || ""}\n`;

        const dateRange = [
          edu.startDate ? new Date(edu.startDate).getFullYear() : "",
          edu.current
            ? "Present"
            : edu.endDate
            ? new Date(edu.endDate).getFullYear()
            : "",
        ]
          .filter(Boolean)
          .join(" - ");

        text += dateRange ? `${dateRange}\n` : "";
        text += edu.gpa ? `GPA: ${edu.gpa}\n` : "";
        text += "\n";
      }
    );
  }

  // Skills
  if (resume.content?.skills?.length) {
    text += "SKILLS\n";
    text += "======\n";
    text += resume.content.skills.join(", ") + "\n\n";
  }

  // Projects
  if (resume.content?.projects?.length) {
    text += "PROJECTS\n";
    text += "========\n";

    resume.content.projects.forEach(
      (project: {
        name?: string;
        description?: string;
        technologies?: string;
        url?: string;
      }) => {
        text += `${project.name || ""}\n`;
        text += project.description ? `${project.description}\n` : "";
        text += project.technologies
          ? `Technologies: ${project.technologies}\n`
          : "";
        text += project.url ? `URL: ${project.url}\n` : "";
        text += "\n";
      }
    );
  }

  return text;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const format = request.nextUrl.searchParams.get("format") || "pdf";
    const resume = await getResumeById(params.id);

    if (format === "text") {
      const plainText = resumeToPlainText(resume);

      // Create a text blob
      return new NextResponse(plainText, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="${
            resume.title?.replace(/[^a-zA-Z0-9]/g, "_") || "resume"
          }.txt"`,
        },
      });
    }

    if (format === "docx") {
      // For DOCX, you might need a more sophisticated approach
      // This is a simplified version - you might want to use a library like docx.js for better formatting
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 1cm; }
              h1, h2, h3 { color: #333; }
              .header { text-align: center; margin-bottom: 20px; }
              .section { margin-bottom: 15px; }
              .section-title { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
              .job-title { font-weight: bold; }
              .company { }
              .date-range { color: #666; }
              .skill-tag { display: inline-block; margin-right: 8px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${resume.content?.personalInfo?.name || "Resume"}</h1>
              <p>
                ${
                  resume.content?.personalInfo?.email
                    ? `Email: ${resume.content.personalInfo.email}`
                    : ""
                }
                ${
                  resume.content?.personalInfo?.phone
                    ? ` | Phone: ${resume.content.personalInfo.phone}`
                    : ""
                }
                ${
                  resume.content?.personalInfo?.location
                    ? ` | Location: ${resume.content.personalInfo.location}`
                    : ""
                }
              </p>
              ${
                resume.content?.personalInfo?.linkedin
                  ? `<p>LinkedIn: ${resume.content.personalInfo.linkedin}</p>`
                  : ""
              }
              ${
                resume.content?.personalInfo?.website
                  ? `<p>Website: ${resume.content.personalInfo.website}</p>`
                  : ""
              }
            </div>

            ${
              resume.content?.summary
                ? `
            <div class="section">
              <h2 class="section-title">Professional Summary</h2>
              <p>${resume.content.summary}</p>
            </div>
            `
                : ""
            }

            ${
              resume.content?.experience?.length
                ? `
            <div class="section">
              <h2 class="section-title">Experience</h2>
              ${resume.content.experience
                .map(
                  (exp: {
                    position?: string;
                    company?: string;
                    location?: string;
                    startDate?: string;
                    endDate?: string;
                    current?: boolean;
                    responsibilities?: string[];
                  }) => `
                <div class="job">
                  <p class="job-title">${exp.position || ""}</p>
                  <p class="company">${exp.company || ""}${
                    exp.location ? `, ${exp.location}` : ""
                  }</p>
                  <p class="date-range">
                    ${
                      exp.startDate
                        ? new Date(exp.startDate).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "short" }
                          )
                        : ""
                    }
                    - 
                    ${
                      exp.current
                        ? "Present"
                        : exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                          })
                        : ""
                    }
                  </p>
                  ${
                    exp.responsibilities?.length
                      ? `
                  <ul>
                    ${exp.responsibilities
                      .map((resp: string) => `<li>${resp}</li>`)
                      .join("")}
                  </ul>
                  `
                      : ""
                  }
                </div>
              `
                )
                .join("")}
            </div>
            `
                : ""
            }

            ${
              resume.content?.education?.length
                ? `
            <div class="section">
              <h2 class="section-title">Education</h2>
              ${resume.content.education
                .map(
                  (edu: {
                    degree?: string;
                    fieldOfStudy?: string;
                    institution?: string;
                    startDate?: string;
                    endDate?: string;
                    current?: boolean;
                    gpa?: string;
                  }) => `
                <div class="education">
                  <p class="degree">${edu.degree || ""}${
                    edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""
                  }</p>
                  <p class="institution">${edu.institution || ""}</p>
                  <p class="date-range">
                    ${
                      edu.startDate ? new Date(edu.startDate).getFullYear() : ""
                    }
                    - 
                    ${
                      edu.current
                        ? "Present"
                        : edu.endDate
                        ? new Date(edu.endDate).getFullYear()
                        : ""
                    }
                  </p>
                  ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ""}
                </div>
              `
                )
                .join("")}
            </div>
            `
                : ""
            }

            ${
              resume.content?.skills?.length
                ? `
            <div class="section">
              <h2 class="section-title">Skills</h2>
              <p>${resume.content.skills
                .map(
                  (skill: string) => `<span class="skill-tag">${skill}</span>`
                )
                .join(" ")}</p>
            </div>
            `
                : ""
            }

            ${
              resume.content?.projects?.length
                ? `
            <div class="section">
              <h2 class="section-title">Projects</h2>
              ${resume.content.projects
                .map(
                  (project: {
                    name?: string;
                    description?: string;
                    technologies?: string;
                    url?: string;
                  }) => `
                <div class="project">
                  <p class="project-name">${project.name || ""}</p>
                  ${project.description ? `<p>${project.description}</p>` : ""}
                  ${
                    project.technologies
                      ? `<p><strong>Technologies:</strong> ${project.technologies}</p>`
                      : ""
                  }
                  ${
                    project.url
                      ? `<p><strong>URL:</strong> <a href="${project.url}">${project.url}</a></p>`
                      : ""
                  }
                </div>
              `
                )
                .join("")}
            </div>
            `
                : ""
            }
          </body>
        </html>
      `;

      // For this to work, you'll need to install:
      // npm install mammoth html-docx-js
      // This is a simplified example - a real solution would need more formatting
      const buffer = Buffer.from(htmlContent, "utf-8");

      // In a real implementation, you might use a library like docx-templates or html-docx-js
      // For now, we'll just return the HTML as a .docx file
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${
            resume.title?.replace(/[^a-zA-Z0-9]/g, "_") || "resume"
          }.docx"`,
        },
      });
    }

    return new NextResponse(JSON.stringify({ error: "Unsupported format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate file" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

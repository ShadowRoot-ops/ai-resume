import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BulkUploadTool from "@/components/dashboard/BulkUploadTool";

export default async function BulkUploadPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Bulk Upload Templates</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300 max-w-3xl">
        Upload multiple resume templates at once to quickly build your template
        library. Ideal for recruiting agencies and HR teams.
      </p>
      <BulkUploadTool userId={userId} />
    </div>
  );
}

// src/types/html-to-docx.d.ts
declare module "html-to-docx" {
  interface Options {
    title?: string;
    orientation?: "portrait" | "landscape";
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    font?: {
      family?: string;
      size?: number;
    };
    header?: string;
    footer?: string;
    pageNumber?: boolean;
  }

  function HTMLtoDOCX(
    html: string,
    headerHTML?: string | null,
    options?: Options,
    footerHTML?: string | null
  ): Promise<Buffer>;

  export = HTMLtoDOCX;
}

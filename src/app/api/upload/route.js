import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type") || "image";

    if (!file || file.size === 0) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const pdfTypes = ["application/pdf"];

    if (type === "image" && !imageTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Only JPG, PNG, and WEBP images are allowed" },
        { status: 400 }
      );
    }

    if (type === "cv" && !pdfTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Only PDF file is allowed for CV upload" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const folderName = type === "cv" ? "uploads/cv" : "uploads";
    const uploadDir = path.join(process.cwd(), "public", folderName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeFileName = file.name.replace(/\s+/g, "-");
    const fileName = `${Date.now()}-${safeFileName}`;
    const filePath = path.join(uploadDir, fileName);
    const dbFilePath =
      type === "cv" ? `/uploads/cv/${fileName}` : `/uploads/${fileName}`;

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      message: "File uploaded successfully",
      filePath: dbFilePath,
      fileName,
      fileType: file.type,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Upload failed", error: error.message },
      { status: 500 }
    );
  }
}
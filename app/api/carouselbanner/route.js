import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";
import { connectDb } from "@/utils/lib/connectDb";
import bannerModel from "@/utils/models/carouselBannerSchema";

export async function GET() {
  try {
    await connectDb();
    const banners = await bannerModel.find({});
    return NextResponse.json(banners, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message, status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDb();

    const formData = await req.formData();
    const timeStamp = Date.now();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: "No image provided",
      });
    }

    const imageByteData = await image.arrayBuffer();
    const buffer = Buffer.from(imageByteData);

    const savePath = path.join(
      "/home/adfilmz/htdocs/adfilmz.com/public/assets/img/bannercarousel",
      `${timeStamp}_${image.name}`
    );

    console.log(`Saving image to: ${savePath}`);

    try {
      await fs.promises.writeFile(savePath, buffer);
      // Set file permissions to 644, sufficient for read access by the web server.
      await fs.promises.chmod(savePath, 0o644);
      console.log("Image saved successfully.");
    } catch (writeError) {
      console.error("Error saving image:", writeError);
      return NextResponse.json({
        success: false,
        status: 500,
        message: "Error saving image to the server",
      });
    }

    if (fs.existsSync(savePath)) {
      // Construct the relative URL for the image
      const imageUrl = `/assets/img/bannercarousel/${timeStamp}_${image.name}`;

      const newBanner = {
        bannerTitle: formData.get("bannerTitle"),
        bannerDescription: formData.get("bannerDescription"),
        image: imageUrl,
      };

      await bannerModel.create(newBanner);

      return NextResponse.json({
        newBanner,
        success: true,
        status: 201,
        message: "Banner added successfully",
      });
    } else {
      return NextResponse.json({
        success: false,
        status: 500,
        message: "Image not saved on the server",
      });
    }
  } catch (error) {
    console.error(`Error processing POST request:`, error);
    return NextResponse.json({
      success: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
}

export async function DELETE(req) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: "Banner ID is required",
      });
    }

    const banner = await bannerModel.findById(id);

    if (!banner) {
      return NextResponse.json({
        success: false,
        status: 404,
        message: "Banner not found",
      });
    }

    const imagePath = path.join(
      "/home/adfilmz/htdocs/adfilmz.com/public/assets/img/bannercarousel",
      path.basename(banner.image)
    );

    console.log(`Attempting to delete file at path: ${imagePath}`);

    if (fs.existsSync(imagePath)) {
      try {
        await fs.promises.unlink(imagePath);
        console.log(`Successfully deleted image at ${imagePath}`);
      } catch (unlinkError) {
        console.error(`Failed to delete image at ${imagePath}:`, unlinkError);
        return NextResponse.json({
          success: false,
          status: 500,
          message: "Failed to delete the image file from the server",
        });
      }
    } else {
      console.error(`Image at path ${imagePath} does not exist`);
      return NextResponse.json({
        success: false,
        status: 404,
        message: "Image file does not exist on the server",
      });
    }

    const deletedBanner = await bannerModel.findByIdAndDelete(id);

    if (!deletedBanner) {
      return NextResponse.json({
        success: false,
        status: 404,
        message: "Banner not found in the database",
      });
    }

    return NextResponse.json({
      success: true,
      status: 200,
      message: "Banner and associated image deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE method:", error);
    return NextResponse.json({
      success: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
}

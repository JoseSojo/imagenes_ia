import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { HfInference } from '@huggingface/inference'
import fs, { writeFile, readFile } from "fs/promises";
import path from "path"; 

const KEY = `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`;

const hf = new HfInference(KEY);

const PathStorage = path.join(process.cwd(), `/public`)

export async function POST(
  request: Request,
  res: NextApiResponse
) {
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false });
  }

  const FilesDate = [
    `_${Date.now()}_${Math.floor(Math.random()*100)}.jpg`,
    `_${Date.now()}_${Math.floor(Math.random()*100)}.jpg`
  ]

  const NamesFile = [];
  NamesFile[0] = path.join(PathStorage,FilesDate[0]);
  NamesFile[1] = path.join(PathStorage,FilesDate[1]);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = NamesFile[0];
  await writeFile(filePath, buffer);

  // READ IMAGE
  const ReadImage = await hf.imageToText({
    data: await readFile(NamesFile[0]),
    model: 'nlpconnect/vit-gpt2-image-captioning'
  });

  // INTERPRETE IMAGE
  const oldImageUrl = new Blob([await readFile(NamesFile[0])]);
  const newImageBlob = await hf.imageToImage({
    model: "ghoskno/Color-Canny-Controlnet-model",
    inputs: oldImageUrl
  });
  const bufferCompare = await newImageBlob.arrayBuffer();
  const bufferCompareRes = Buffer.from(bufferCompare);
  await writeFile(NamesFile[1], bufferCompareRes); // CREATE NEW IMAGE

  /*
  const oldImageUrl2 = new Blob([await readFile(NamesFile[1])]);
  const newImageBlob2 = await hf.imageToImage({
    model: "ghoskno/Color-Canny-Controlnet-model",
    inputs: oldImageUrl
  });
  const bufferCompare2 = await newImageBlob.arrayBuffer();
  const bufferCompareRes2 = Buffer.from(bufferCompare);
  await writeFile(NamesFile[2], bufferCompareRes);*/

  return NextResponse.json({ body:{ preview:ReadImage.generated_text, images:FilesDate } }, { status: 200 });
}
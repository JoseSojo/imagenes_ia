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
    const body = await request.json();

    if (!body.input) {
        return NextResponse.json({ success: false });
    }

    const FileDate = [`_${Date.now()}_${Math.floor(Math.random()*100)}.jpg`,`_${Date.now()}_${Math.floor(Math.random()*100)}.jpg`];
    const NamesFile = [path.join(PathStorage,FileDate[0]),path.join(PathStorage,FileDate[1])];

    const promiseImg = hf.textToImage({
        inputs: body.input,
        model: 'stabilityai/stable-diffusion-2',
        parameters: {
          negative_prompt: 'blurry',
        }
    });

    const promiseImg2 = hf.textToImage({
        inputs: body.input,
        model: 'IDKiro/sdxs-512-0.9',
        parameters: {
          negative_prompt: 'blurry',
        }
    });

    const img = await promiseImg;
    const bufferCompare = await img.arrayBuffer();
    const bufferCompareRes = Buffer.from(bufferCompare);
    await writeFile(NamesFile[0], bufferCompareRes); // CREATE NEW IMAGE

    const img2 = await promiseImg2;
    const bufferCompare2 = await img2.arrayBuffer();
    const bufferCompareRes2 = Buffer.from(bufferCompare);
    await writeFile(NamesFile[1], bufferCompareRes); // CREATE NEW IMAGE

  return NextResponse.json({ body:{preview:FileDate} }, { status: 200 });
}
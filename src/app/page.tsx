"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useRef, useState } from "react";

const Load = () => <span className="absolute -top-8 -left-8 w-16 h-16 rounded-full bg-transparent border-t-4 border-t-blue-500 animate-spin"></span>

type PayloadLan = `es` | `en`;

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [load, setLoad] = useState(false);
  const [output, setOutput] = useState(``);
  const [previewImg, setPreviewImg] = useState<string[] | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const ImageToImage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if(!image) return;

    const formData = new FormData();
    formData.append(`file`, image);

    setLoad(true);
    fetch(`/api/`, { method:"POST", body: formData  })
      .then(res => {
        if(!res.ok) {
          setError(`Error temporal...`);
          throw new Error();
        }
        return res.json();
      })
      .then(trans => {
        const result = trans as { body: { preview:string, images:string[] }};
        const img = [result.body.images[0],result.body.images[1]];
        console.log(img);
        setPreviewImg(img);
        console.log(result);
        return setOutput(result.body.preview);
      })
      .finally(() => {
        setLoad(false);
      });
  }

  const TextToImage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if(!output) return;

    setLoad(true);
    fetch(`/api/image`, { method:"POST", body: JSON.stringify({input:output})  })
      .then(res => {
        if(!res.ok) {
          setError(`Error temporal...`);
          throw new Error();
        }
        return res.json();
      })
      .then(trans => {
        const result = trans as { body: { preview:string[] }};
        return setPreviewImg(result.body.preview);
      })
      .finally(() => {
        setLoad(false);
      });
  }

  return (
    <main className="grid place-items-center w-screen min-h-screen bg-gray-900">
      <div className="w-[90vw] lg:w-[80vw] p-4 rounded-lg bg-gray-500 flex flex-col justify-between gap-3 relative">
        <h1 className="w-full text-center font-bold mb-9">
          <span className="text-2xl">Imagen a Imagen</span> 
          <span className="text-gray-300 text-sm mx-3">(modelo de IA)</span>
        </h1>

        { load && <Load /> }

        <div className="grid  grid-cols-[.5fr_1fr] gap-3">
          <div className="relative">
            <form onSubmit={ImageToImage} className="relative grid place-items-center gap: 5">
              
              <div className="input-div">
                <input className="input" onChange={(e)=>{ if(e.target.files && e.target.files.length > 0) setImage(e.target.files[0]) }} name="file" type="file" />
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" stroke-linejoin="round" stroke-linecap="round" viewBox="0 0 24 24" stroke-width="2" fill="none" stroke="currentColor" className="icon"><polyline points="16 16 12 12 8 16"></polyline><line y2="21" x2="12" y1="12" x1="12"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>
              </div>

              <button
                type="submit"
                className="flex mt-5 items-center bg-blue-500 text-white gap-1 px-4 py-2 cursor-pointer font-semibold tracking-widest rounded-md hover:bg-blue-400 duration-300 hover:gap-2 hover:translate-x-3"
              >
                Enviar
                <svg
                  className="w-5 h-5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                  ></path>
                </svg>
              </button>

            </form>
          </div>
          <div 
            className="p-4 w-full flex flex-col gap-2 min-h-40 bg-gray-t-100 text-gray-900" 
          >
              <form onSubmit={TextToImage} className="flex w-full text-center">
                  <input onChange={(e)=>setOutput(e.target.value)} type="text" className="rounded-l-md bg-transparent h-full bg-slate-900 text-gray-100 outline-none p-3 flex-1" value={output} />
                  <input type="submit" className="py-3 px-8 rounded-r-md bg-blue-500 hover:bg-blue-600 text-white font-bold" />
              </form>
              <div className="grid grid-cols-2 gap-2">
                {
                  previewImg
                  ? <>
                    {
                      previewImg.map((item) => (
                        <Image width={100} height={200} key={item} src={`/${item}`} className="w-full h-[200px] bg-gray-950 rounded-md" alt="preview" />
                      ))
                    }
                  </>
                  : <>
                    <div className="w-full h-[200px] bg-slate-900 rounded-md animate-pulse"></div>
                    <div className="w-full h-[200px] bg-slate-900 rounded-md animate-pulse"></div>
                  </>
                }
              </div>
          </div>
        </div>
      </div>
    </main>
  );
}

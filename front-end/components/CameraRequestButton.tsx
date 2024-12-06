import React, { useRef, useState, useEffect } from "react";
import "../src/css/style.css";
/* import { FileInput } from "flowbite-react"; */

const CameraRequestButton: React.FC<{ onCapture: (image: string) => void }> = ({
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleRequestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasPermission(true);
      setError(null); // Limpa o erro se a permissão for concedida
      return stream;
    } catch (err) {
      setError("Erro ao acessar a câmera: " + (err as Error).message);
      setHasPermission(false);
      return null;
    }
  };

  const stopStream = (stream: MediaStream) => {
    stream.getTracks().forEach((track) => track.stop());
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    return () => {
      if (stream) stopStream(stream);
    };
  }, []);

  const handleCapture = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = 300;
        canvasRef.current.height = 300;
        context.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        const dataURL = canvasRef.current.toDataURL("image/png");
        const base64Data = dataURL.split(",")[1];
        setPreview(dataURL);
        onCapture(base64Data);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          const base64Data = reader.result.split(",")[1];
          setPreview(reader.result as string);
          onCapture(base64Data);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <button
          onClick={handleRequestCamera}
          className="btn bg-red-1 text-white"
        >
          Solicitar Acesso à Câmera
        </button>
        <div style={{ marginTop: "20px" }}>
          {hasPermission && (
            <>
              <video
                ref={videoRef}
                width="100%"
                height="auto"
                autoPlay
                style={{ maxWidth: "100%" }}
              ></video>
              <button
                onClick={handleCapture}
                className="btn bg-green-1 text-white"
              >
                Capturar Imagem
              </button>
              <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
            </>
          )}
          {error && <p>{error}</p>}
        </div>
      </div>
      <div className="">
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleFileUpload}
          className="file-input   file-input-secondary  w-full max-w-xs"
        />
        {/*  <FileInput
          id="file-upload-helper-text"
          helperText="SVG, PNG, JPG or GIF (MAX. 800x400px)."
        /> */}
        {preview && (
          <div style={{ marginTop: "20px" }}>
            <h4 className="font-semibold mb-4">Prévia da Imagem:</h4>
            <div>
              <img
                src={preview}
                alt="Prévia"
                style={{ width: "300px", height: "300px", objectFit: "cover" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraRequestButton;

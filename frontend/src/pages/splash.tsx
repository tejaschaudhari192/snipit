import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import TextType from "@/components/TextType";

const SplashPage = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-white">
      <div className="text-center animate-fade-in">
        <h1 className="text-7xl font-bold text-foreground mb-4 tracking-tight">
          Snipit
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          <TextType text={"Share your snippets instantly"} />
        </p>
        <Progress value={progress} className="w-64 mx-auto" />
      </div>
    </div>
  );
};

export default SplashPage;

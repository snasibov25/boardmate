import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Camera, Wifi } from "lucide-react";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";

interface CameraViewProps {
  isConnected: boolean;
}

export function CameraView({ isConnected }: CameraViewProps) {
  const [timestamp, setTimestamp] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Live Camera Feed</CardTitle>
            <CardDescription>Real-time view from robot camera</CardDescription>
          </div>
          <Badge className={isConnected ? "bg-green-500" : "bg-red-500"}>
            <Wifi className="size-3 mr-1" />
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          {isConnected ? (
            <>
              {/* Simulated camera feed - in production this would be a video stream */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="size-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Camera Feed Active</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              {/* Overlay elements */}
              <div className="absolute top-3 left-3">
                <div className="bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <div className="size-2 bg-red-500 rounded-full animate-pulse" />
                  REC
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs">
                1920x1080 @ 30fps
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Camera className="size-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">Camera Disconnected</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

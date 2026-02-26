import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Eraser, ScanLine, PenTool, Power, Pause, Play } from "lucide-react";
import { Badge } from "./ui/badge";

type RobotMode = "clean" | "scan" | "write" | "idle";
type RobotStatus = "active" | "paused" | "stopped";

interface RobotControlsProps {
  mode: RobotMode;
  status: RobotStatus;
  onModeChange: (mode: RobotMode) => void;
  onStatusChange: (status: RobotStatus) => void;
}

export function RobotControls({ mode, status, onModeChange, onStatusChange }: RobotControlsProps) {
  const getModeIcon = (m: RobotMode) => {
    switch (m) {
      case "clean":
        return <Eraser className="size-5" />;
      case "scan":
        return <ScanLine className="size-5" />;
      case "write":
        return <PenTool className="size-5" />;
      default:
        return <Power className="size-5" />;
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      active: { label: "Active", className: "bg-green-500" },
      paused: { label: "Paused", className: "bg-yellow-500" },
      stopped: { label: "Stopped", className: "bg-gray-500" },
    };
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Robot Controls</CardTitle>
            <CardDescription>Select operation mode and control robot status</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm mb-2">Operation Mode</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button
              variant={mode === "clean" ? "default" : "outline"}
              onClick={() => onModeChange("clean")}
              className="flex items-center gap-2"
            >
              <Eraser className="size-4" />
              Clean
            </Button>
            <Button
              variant={mode === "scan" ? "default" : "outline"}
              onClick={() => onModeChange("scan")}
              className="flex items-center gap-2"
            >
              <ScanLine className="size-4" />
              Scan
            </Button>
            <Button
              variant={mode === "write" ? "default" : "outline"}
              onClick={() => onModeChange("write")}
              className="flex items-center gap-2"
            >
              <PenTool className="size-4" />
              Write
            </Button>
            <Button
              variant={mode === "idle" ? "default" : "outline"}
              onClick={() => onModeChange("idle")}
              className="flex items-center gap-2"
            >
              <Power className="size-4" />
              Idle
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm mb-2">Robot Status</p>
          <div className="flex gap-2">
            <Button
              variant={status === "active" ? "default" : "outline"}
              onClick={() => onStatusChange("active")}
              className="flex items-center gap-2 flex-1"
              disabled={mode === "idle"}
            >
              <Play className="size-4" />
              Start
            </Button>
            <Button
              variant={status === "paused" ? "default" : "outline"}
              onClick={() => onStatusChange("paused")}
              className="flex items-center gap-2 flex-1"
              disabled={mode === "idle" || status === "stopped"}
            >
              <Pause className="size-4" />
              Pause
            </Button>
            <Button
              variant={status === "stopped" ? "default" : "outline"}
              onClick={() => onStatusChange("stopped")}
              className="flex items-center gap-2 flex-1"
              disabled={mode === "idle"}
            >
              <Power className="size-4" />
              Stop
            </Button>
          </div>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            {getModeIcon(mode)}
            <span className="text-sm">
              Current Mode: <strong className="capitalize">{mode}</strong>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

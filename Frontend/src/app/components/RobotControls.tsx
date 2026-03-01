import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Eraser, ScanLine, PenTool, Power, Pause, Play, ArrowLeftRight, ArrowUpDown, Beaker, PlayCircle, ShieldCheck } from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

type RobotMode = "clean" | "scan" | "write" | "idle";
type RobotStatus = "active" | "paused" | "stopped";

interface RobotControlsProps {
    mode: RobotMode;
    status: RobotStatus;
    onModeChange: (mode: RobotMode) => void;
    onStatusChange: (status: RobotStatus) => void;
}

export function RobotControls({ mode, status, onModeChange, onStatusChange }: RobotControlsProps) {

    const sendCommand = async (endpoint: string, successMsg: string, updateStatus?: RobotStatus) => {
        try {
            const response = await fetch(`http://localhost:8080/api/robot/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                toast.success(successMsg);
                if (updateStatus) onStatusChange(updateStatus);
            } else {
                toast.error(`Failed: ${endpoint}`);
            }
        } catch (error) {
            toast.error("Network connection error");
        }
    };

    const handleMove = async (axis: "X" | "Y", distance: number) => {
        const endpoint = axis === "X" ? "MoveInXaxis" : "MoveInYaxis";
        const defaultPins = { stepPin: 0, dirPin: 0, ms1Pin: 0, ms2Pin: 0, ms3Pin: 0, enPin: 0 };

        const movementData = axis === "X"
            ? { ...defaultPins, stepPin: 2, dirPin: 3, steps: distance * 50 }
            : { ...defaultPins, stepPin: 8, dirPin: 9, steps: distance * 50 };

        try {
            const response = await fetch(`http://localhost:8080/api/robot/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...movementData, direction: distance > 0, enable: true }),
            });
            if (response.ok) toast.success(`${axis}-axis moved ${distance}mm`);
        } catch (error) {
            toast.error("Network error");
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Robot Controls</CardTitle>
                        <CardDescription>Control the BoardMate system and run routines</CardDescription>
                    </div>
                    <Badge className={status === "active" ? "bg-green-500" : status === "paused" ? "bg-yellow-500" : "bg-gray-500"}>
                        {status.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* 1. Operation Mode (保留原样) */}
                <div>
                    <p className="text-sm mb-2 font-semibold text-muted-foreground uppercase tracking-wider">Operation Mode</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <Button variant={mode === "clean" ? "default" : "outline"} onClick={() => onModeChange("clean")} className="gap-2"><Eraser className="size-4" />Clean</Button>
                        <Button variant={mode === "scan" ? "default" : "outline"} onClick={() => onModeChange("scan")} className="gap-2"><ScanLine className="size-4" />Scan</Button>
                        <Button variant={mode === "write" ? "default" : "outline"} onClick={() => onModeChange("write")} className="gap-2"><PenTool className="size-4" />Write</Button>
                        <Button variant={mode === "idle" ? "default" : "outline"} onClick={() => onModeChange("idle")} className="gap-2"><Power className="size-4" />Idle</Button>
                    </div>
                </div>

                {/* 2. Movement Control (保留原样) */}
                <div>
                    <p className="text-sm mb-2 font-semibold text-muted-foreground uppercase tracking-wider">Manual Movement</p>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => handleMove("X", 10)} className="gap-2"><ArrowLeftRight className="size-4" />Move X (10mm)</Button>
                        <Button variant="outline" onClick={() => handleMove("Y", 10)} className="gap-2"><ArrowUpDown className="size-4" />Move Y (10mm)</Button>
                    </div>
                </div>

                {/* 3. Status Control (Start/Pause/Stop) */}
                <div>
                    <p className="text-sm mb-2 font-semibold text-muted-foreground uppercase tracking-wider">Execution Control</p>
                    <div className="flex gap-2">
                        <Button variant={status === "active" ? "default" : "outline"} onClick={() => sendCommand("start", "Robot Started", "active")} className="flex-1 gap-2" disabled={mode === "idle"}><Play className="size-4" />Start</Button>
                        <Button variant={status === "paused" ? "default" : "outline"} onClick={() => sendCommand("pause", "Robot Paused", "paused")} className="flex-1 gap-2" disabled={mode === "idle" || status === "stopped"}><Pause className="size-4" />Pause</Button>
                        <Button variant={status === "stopped" ? "outline" : "destructive"} onClick={() => sendCommand("stop", "Robot Stopped", "stopped")} className="flex-1 gap-2" disabled={mode === "idle"}><Power className="size-4" />Stop</Button>
                    </div>
                </div>

                {/* --- 新增：Advanced Automation (Demo & Test) --- */}
                <div className="pt-2 border-t">
                    <p className="text-sm mb-3 font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="size-4" /> Specialized Routines
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                            onClick={() => sendCommand("startDemo", "Demo sequence initiated", "active")}
                        >
                            <PlayCircle className="mr-2 size-4" />
                            Run Demo
                        </Button>
                        <Button
                            variant="secondary"
                            className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
                            onClick={() => sendCommand("startTest", "Diagnostic test started", "active")}
                        >
                            <Beaker className="mr-2 size-4" />
                            Run Test
                        </Button>
                    </div>
                </div>

                {/* Current Mode Display */}
                <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                    <div className="p-2 bg-background rounded-full shadow-sm">
                        {mode === "clean" && <Eraser className="size-4" />}
                        {mode === "scan" && <ScanLine className="size-4" />}
                        {mode === "write" && <PenTool className="size-4" />}
                        {mode === "idle" && <Power className="size-4" />}
                    </div>
                    <span className="text-sm">System ready for <strong>{mode}</strong> mode.</span>
                </div>
            </CardContent>
        </Card>
    );
}
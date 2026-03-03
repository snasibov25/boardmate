import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
    Eraser,
    ScanLine,
    PenTool,
    Power,
    Pause,
    Play,
    Beaker,
    PlayCircle,
    ShieldCheck
} from "lucide-react";
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

export default function RobotControls({ mode, status, onModeChange, onStatusChange }: RobotControlsProps) {
    const [moveDirection, setMoveDirection] = useState<"u" | "d" | "r" | "l">("u");
    const [moveSteps, setMoveSteps] = useState<number | "">("");
    const [gotoX, setGotoX] = useState<number | "">("");
    const [gotoY, setGotoY] = useState<number | "">("");

    const sendCommand = async (command: string, successMsg?: string, updateStatus?: RobotStatus, extra?: string) => {
        try {
            const response = await fetch("http://localhost:8080/api/robot/commands", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command }),
            });

            if (response.ok) {
                if (successMsg) toast.success(successMsg);
                if (updateStatus) onStatusChange(updateStatus);
                if (extra) {
                    await fetch("http://localhost:8080/api/robot/commands", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ command: extra }),
                    });
                }
            } else {
                toast.error(`Command failed: ${command}`);
            }
        } catch (error) {
            toast.error("Network connection error");
        }
    };

    const handleMove = () => {
        if (!moveSteps || isNaN(Number(moveSteps))) {
            toast.error("Please enter valid steps");
            return;
        }
        const command = `move ${moveDirection} ${moveSteps}`;
        sendCommand(command, `Move command sent: ${moveDirection} ${moveSteps}`);
    };

    const handleGoto = () => {
        if (isNaN(Number(gotoX)) || isNaN(Number(gotoY))) {
            toast.error("Please enter valid coordinates");
            return;
        }
        const command = `goto ${gotoX} ${gotoY}`;
        sendCommand(command, `Moving to (${gotoX}, ${gotoY})`);
    };

    const handleStart = async () => {
        if (mode === "idle") {
            toast.error("Please select a mode before starting");
            return;
        }
        onStatusChange("active");
        await sendCommand("start", "Robot Started");
        if (mode === "scan") {
            await fetch("http://localhost:8080/api/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ start_scanning: true }),
            });
            toast.success("Camera scanning started");
        }
    };

    return (
        <Card className="space-y-4">
            {/* Header + Status */}
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle>Robot Controls</CardTitle>
                    <CardDescription>Control the BoardMate system</CardDescription>
                </div>
                <Badge
                    className={`px-3 py-1 rounded-full ${
                        status === "active"
                            ? "bg-green-500"
                            : status === "paused"
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                    }`}
                >
                    {status.toUpperCase()}
                </Badge>
            </CardHeader>

            <CardContent className="space-y-6">

                {/* Mode Selection */}
                <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Operation Mode</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Button variant={mode === "clean" ? "default" : "outline"} onClick={() => onModeChange("clean")} className="gap-2"><Eraser className="size-4" />Clean</Button>
                        <Button variant={mode === "scan" ? "default" : "outline"} onClick={() => onModeChange("scan")} className="gap-2"><ScanLine className="size-4" />Scan</Button>
                        <Button variant={mode === "write" ? "default" : "outline"} onClick={() => onModeChange("write")} className="gap-2"><PenTool className="size-4" />Write</Button>
                        <Button variant={mode === "idle" ? "default" : "outline"} onClick={() => onModeChange("idle")} className="gap-2"><Power className="size-4" />Idle</Button>
                    </div>
                </div>

                {/* Manual Move + Goto + Reset */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Manual Move */}
                    <div className="border p-3 rounded-md space-y-2">
                        <p className="text-sm font-semibold text-gray-600 uppercase">Manual Movement</p>
                        <div className="flex gap-2 items-center">
                            <select value={moveDirection} onChange={(e) => setMoveDirection(e.target.value as any)} className="border rounded px-2 py-1 w-24">
                                <option value="u">Up</option>
                                <option value="d">Down</option>
                                <option value="r">Right</option>
                                <option value="l">Left</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Steps"
                                value={moveSteps}
                                onChange={(e) => setMoveSteps(Number(e.target.value))}
                                className="border rounded px-2 py-1 w-24"
                            />
                            <Button onClick={handleMove} className="flex-1">Move</Button>
                        </div>
                    </div>

                    {/* Goto + Reset */}
                    <div className="border p-3 rounded-md space-y-2">
                        <p className="text-sm font-semibold text-gray-600 uppercase">Goto Position</p>
                        <div className="flex gap-2 items-center mb-2">
                            <input
                                type="number"
                                placeholder="X"
                                value={gotoX}
                                onChange={(e) => setGotoX(Number(e.target.value))}
                                className="border rounded px-2 py-1 w-24"
                            />
                            <input
                                type="number"
                                placeholder="Y"
                                value={gotoY}
                                onChange={(e) => setGotoY(Number(e.target.value))}
                                className="border rounded px-2 py-1 w-24"
                            />
                            <Button onClick={handleGoto} className="flex-1">Go</Button>
                        </div>
                        <Button variant="secondary" onClick={() => sendCommand("goto 0 0", "Position reset to (0,0)")} className="w-full">
                            Reset Position
                        </Button>
                    </div>
                </div>

                {/* Execution Control */}
                <div className="border p-3 rounded-md space-y-2">
                    <p className="text-sm font-semibold text-gray-600 uppercase">Execution Control</p>
                    <div className="flex gap-2">
                        <Button variant={status === "active" ? "default" : "outline"} onClick={handleStart} className="flex-1 gap-2"><Play className="size-4" />Start</Button>
                        <Button variant={status === "paused" ? "default" : "outline"} onClick={() => {
                            if (mode === "idle") { toast.error("Please select a mode before starting"); return; }
                            sendCommand("pause", "Robot Paused", "paused");
                        }} className="flex-1 gap-2"><Pause className="size-4" />Pause</Button>
                        <Button variant="destructive" onClick={() => sendCommand("stop", "Robot Stopped", "stopped")} className="flex-1 gap-2"><Power className="size-4" />Stop</Button>
                    </div>
                </div>

                {/* Demo / Test */}
                <div className="border p-3 rounded-md">
                    <p className="text-sm font-semibold text-gray-600 uppercase flex items-center gap-2 mb-2"><ShieldCheck className="size-4"/>Specialized Routines</p>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="secondary" onClick={() => sendCommand("demo", "Demo sequence initiated", "active")}><PlayCircle className="mr-2 size-4"/>Run Demo</Button>
                        <Button variant="secondary" onClick={() => sendCommand("test", "Diagnostic test started", "active")}><Beaker className="mr-2 size-4"/>Run Test</Button>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Eraser, ScanLine, PenTool, Power, Pause, Play, ArrowLeftRight, ArrowUpDown } from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner"; // Assuming sonner is installed

type RobotMode = "clean" | "scan" | "write" | "idle";
type RobotStatus = "active" | "paused" | "stopped";

interface RobotControlsProps {
    mode: RobotMode;
    status: RobotStatus;
    onModeChange: (mode: RobotMode) => void;
    onStatusChange: (status: RobotStatus) => void;
}

export function RobotControls({ mode, status, onModeChange, onStatusChange }: RobotControlsProps) {

    // --- Move function to call Backend API ---
    const handleMove = async (axis: "X" | "Y", distance: number) => {
        const endpoint = axis === "X" ? "MoveInXaxis" : "MoveInYaxis";

        // 1. Define base default pin configuration
        const defaultPins = {
            stepPin: 0,
            dirPin: 0,
            ms1Pin: 0,
            ms2Pin: 0,
            ms3Pin: 0,
            enPin: 0,
        };

        // 2. Map axis to specific pins and calculate steps
        // NOTE: Replace 2, 3, 4, 5, etc., with your actual Arduino pin numbers
        const movementData = axis === "X" ? {
            ...defaultPins,
            stepPin: 2,
            dirPin: 3,
            steps: distance * 50, // Example conversion: 1mm = 50 steps
        } : {
            ...defaultPins,
            stepPin: 8,
            dirPin: 9,
            steps: distance * 50,
        };

        // 3. Assemble full request body
        const requestBody = {
            ...movementData,
            direction: distance > 0, // true = forward, false = backward
            enable: true,
        };

        try {
            console.log(`Attempting to move ${axis}-axis:`, requestBody);

            // Send POST request to backend
            const response = await fetch(`http://localhost:8080/api/robot/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                toast.success(`${axis}-axis moved ${distance}mm`);
                console.log(`Successfully moved ${axis}-axis`);
            } else {
                toast.error(`Failed to move ${axis}-axis`);
                console.error(`Backend error: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            toast.error("Network connection error");
            console.error("Fetch error:", error);
        }
    };
    // ------------------------------------------

    // --- Function to handle Status Changes (Start/Pause/Stop) ---
    const handleStatusChange = async (newStatus: RobotStatus) => {
        // Map status to endpoint
        const endpoint = newStatus === "active" ? "start" : newStatus === "paused" ? "pause" : "stop";

        try {
            console.log(`Sending command: ${endpoint}`);

            const response = await fetch(`http://localhost:8080/api/robot/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Body might be empty for simple commands, depending on your backend
            });

            if (response.ok) {
                toast.success(`Robot ${newStatus}`);
                console.log(`Successfully sent ${endpoint} command`);
                // Update local UI state
                onStatusChange(newStatus);
            } else {
                toast.error(`Failed to ${endpoint} robot`);
                console.error(`Backend error: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            toast.error("Network connection error");
            console.error("Fetch error:", error);
        }
    };
    // ------------------------------------------

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
                {/* Operation Mode */}
                <div>
                    <p className="text-sm mb-2 font-medium">Operation Mode</p>
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

                {/* Movement Control */}
                <div>
                    <p className="text-sm mb-2 font-medium">Movement Control</p>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => handleMove("X", 10)} className="flex items-center gap-2">
                            <ArrowLeftRight className="size-4" />
                            Move X
                        </Button>
                        <Button variant="outline" onClick={() => handleMove("Y", 10)} className="flex items-center gap-2">
                            <ArrowUpDown className="size-4" />
                            Move Y
                        </Button>
                    </div>
                </div>

                {/* Robot Status */}
                <div>
                    <p className="text-sm mb-2 font-medium">Robot Status</p>
                    <div className="flex gap-2">
                        <Button
                            variant={status === "active" ? "default" : "outline"}
                            onClick={() => handleStatusChange("active")}
                            className="flex items-center gap-2 flex-1"
                            disabled={mode === "idle"}
                        >
                            <Play className="size-4" />
                            Start
                        </Button>
                        <Button
                            variant={status === "paused" ? "default" : "outline"}
                            onClick={() => handleStatusChange("paused")}
                            className="flex items-center gap-2 flex-1"
                            disabled={mode === "idle" || status === "stopped"}
                        >
                            <Pause className="size-4" />
                            Pause
                        </Button>
                        <Button
                            variant={status === "stopped" ? "default" : "outline"}
                            onClick={() => handleStatusChange("stopped")}
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
"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface ExportDialogProps {
    projectName: string;
    frames: any[];
}

export function ExportDialog({ projectName, frames }: ExportDialogProps) {
    const [format, setFormat] = useState("png");
    const [exporting, setExporting] = useState(false);

    const exportToPNG = async () => {
        setExporting(true);
        try {
            for (let i = 0; i < frames.length; i++) {
                const element = document.getElementById(`frame-preview-${i}`);
                if (element) {
                    const canvas = await html2canvas(element, {
                        scale: 2,
                        backgroundColor: null,
                        useCORS: true,
                    });

                    const link = document.createElement("a");
                    link.download = `${projectName}-screen-${i + 1}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                }
            }
            toast.success("Screens exported successfully!");
        } catch (error) {
            toast.error("Failed to export screens");
        } finally {
            setExporting(false);
        }
    };

    const exportToPDF = async () => {
        setExporting(true);
        try {
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "px",
                format: [375, 812], // iPhone X dimensions
            });

            for (let i = 0; i < frames.length; i++) {
                if (i > 0) pdf.addPage();

                const element = document.getElementById(`frame-preview-${i}`);
                if (element) {
                    const canvas = await html2canvas(element, {
                        scale: 2,
                        backgroundColor: "#ffffff",
                        useCORS: true,
                    });

                    const imgData = canvas.toDataURL("image/png");
                    pdf.addImage(imgData, "PNG", 0, 0, 375, 812);
                }
            }

            pdf.save(`${projectName}.pdf`);
            toast.success("PDF exported successfully!");
        } catch (error) {
            toast.error("Failed to export PDF");
        } finally {
            setExporting(false);
        }
    };

    const handleExport = () => {
        if (format === "png") {
            exportToPNG();
        } else {
            exportToPDF();
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export Design</DialogTitle>
                    <DialogDescription>
                        Export your mobile designs as images or PDF
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Format</Label>
                        <RadioGroup value={format} onValueChange={setFormat} className="mt-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="png" id="png" />
                                <Label htmlFor="png">PNG (Individual Images)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pdf" id="pdf" />
                                <Label htmlFor="pdf">PDF (All Screens)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Button
                        onClick={handleExport}
                        disabled={exporting || frames.length === 0}
                        className="w-full"
                    >
                        {exporting ? "Exporting..." : `Export as ${format.toUpperCase()}`}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

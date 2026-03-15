import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define types for data structures (approximated based on usage)
interface WebUsageItem {
    domain: string;
    minutes: number;
    category: string;
    lastUpdated: string;
}

interface AlertItem {
    url: string;
    timestamp: string;
}

interface BlockedItem {
    domain: string;
}

interface ChildData {
    webUsage: WebUsageItem[];
    alerts: AlertItem[];
    blocked: BlockedItem[];
    totalTime: string;
    activities?: any[];
}

export const generatePDFReport = async (
    childName: string,
    childEmail: string,
    parentName: string,
    data: ChildData
) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(34, 197, 94); // SproutSafe Green
    doc.text("SproutSafe Activity Report", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${date}`, 105, 30, { align: "center" });

    // User Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Parent: ${parentName}`, 14, 45);
    doc.text(`Child Profile: ${childName} (${childEmail})`, 14, 52);

    let yPos = 65;

    // 1. Overview Stats
    doc.setFontSize(16);
    doc.setTextColor(30, 174, 219);
    doc.text("Overview", 14, yPos);
    yPos += 10;

    // Parse totalTime to show only minutes
    let totalMinutes = "0 min";
    if (data.totalTime) {
        const timeStr = data.totalTime.toLowerCase(); // Ensure lowercase for regex matching
        const hoursMatch = timeStr.match(/(\d+)\s*h/);
        const minutesMatch = timeStr.match(/(\d+)\s*m/);

        let minutes = 0;
        if (hoursMatch) minutes += parseInt(hoursMatch[1]) * 60;
        if (minutesMatch) minutes += parseInt(minutesMatch[1]);

        // Fallback: if no H or M found but string is a number, treat as minutes
        if (!hoursMatch && !minutesMatch) {
            const raw = parseInt(timeStr);
            if (!isNaN(raw)) minutes = raw;
        }

        totalMinutes = `${minutes} min`;
    }

    const overviewData = [
        ["Metric", "Value"],
        ["Total Screen Time (Today)", totalMinutes],
        ["Active Alerts", data.alerts.length.toString()],
        ["Blocked Websites", data.blocked.length.toString()],
    ];

    autoTable(doc, {
        startY: yPos,
        head: [overviewData[0]],
        body: overviewData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [30, 174, 219] },
        margin: { top: 10 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // 2. Incognito Alerts
    if (data.alerts.length > 0) {
        doc.text("Security Alerts (Incognito)", 14, yPos);
        yPos += 10;

        const alertRows = data.alerts.map(alert => [
            new Date(alert.timestamp).toLocaleString(),
            alert.url,
            "Incognito Detected"
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [["Timestamp", "URL", "Type"]],
            body: alertRows,
            theme: 'striped',
            headStyles: { fillColor: [220, 53, 69] }, // Red for alerts
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // 3. Blocked Content
    if (data.blocked.length > 0) {
        // Check if new page needed
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setTextColor(30, 174, 219);
        doc.text("Blocked Content", 14, yPos);
        yPos += 10;

        const blockedRows = data.blocked.map(item => [item.domain, "Blocked"]);

        autoTable(doc, {
            startY: yPos,
            head: [["Domain", "Status"]],
            body: blockedRows,
            theme: 'grid',
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // 4. Web Usage & Searches
    if (data.webUsage.length > 0) {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setTextColor(30, 174, 219);
        doc.text("Web Activity & Searches", 14, yPos);
        yPos += 10;

        const activityRows = data.webUsage.map(item => [
            item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : "-",
            item.domain,
            item.category || "General"
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [["Last Active", "Domain/Query", "Category"]],
            body: activityRows,
            theme: 'striped',
        });
    }

    // 5. Activity Log (New Section)
    if (data.activities && data.activities.length > 0) {
        // Force new page for Activity Log
        doc.addPage();
        yPos = 20;

        doc.setTextColor(30, 174, 219);
        doc.text("Activity Log (Today)", 14, yPos);
        yPos += 10;

        const logRows = data.activities.map(act => [
            new Date(act.timestamp).toLocaleTimeString(),
            act.content,
            act.type || "Activity"
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [["Time", "Activity", "Type"]],
            body: logRows,
            theme: 'grid',
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount} - SproutSafe Report`, 105, 290, { align: "center" });
    }

    doc.save(`SproutSafe_Report_${childName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

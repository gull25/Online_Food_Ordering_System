/**
 * Generates SVG path data for a line chart based on an array of data points.
 * @param {Array} data - Array of objects, e.g. [{ value: 100, label: 'Oct 01' }, ...]
 * @param {number} width - SVG viewBox width
 * @param {number} height - SVG viewBox height
 * @param {number} padding - Padding around the chart to avoid clipping
 * @returns {Object} - { linePath, areaPath, points }
 */
export const generateChartPaths = (data = [], width = 1000, height = 300, padding = 40) => {
    if (data.length === 0) {
        return {
            linePath: '',
            areaPath: '',
            points: []
        };
    }

    // Find min and max values for scaling
    const values = data.map(d => d.value);
    const minVal = Math.min(0, ...values); // Ensure 0 is always at the bottom
    const maxVal = Math.max(...values, 1); // Avoid division by zero if all values are 0

    const range = maxVal - minVal;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    const points = data.map((d, index) => {
        // If there's only 1 point, center it. Otherwise space them evenly.
        const x = data.length === 1 ? width / 2 : padding + (index / (data.length - 1)) * innerWidth;
        const normalizedY = (d.value - minVal) / range; // 0 to 1
        const y = height - padding - (normalizedY * innerHeight); // Invert Y (SVG 0 is at top)
        
        return {
            cx: x,
            cy: y,
            value: d.value,
            date: d.label
        };
    });

    // Create a smooth cubic bezier curve through the points
    let linePath = '';
    
    if (points.length === 1) {
        linePath = `M${points[0].cx - 50},${points[0].cy} L${points[0].cx + 50},${points[0].cy}`;
    } else {
        linePath = `M${points[0].cx},${points[0].cy}`;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            // Control points for smooth curve (horizontal tangents)
            const cp1X = current.cx + (next.cx - current.cx) / 2;
            const cp1Y = current.cy;
            const cp2X = current.cx + (next.cx - current.cx) / 2;
            const cp2Y = next.cy;
            
            linePath += ` C${cp1X},${cp1Y} ${cp2X},${cp2Y} ${next.cx},${next.cy}`;
        }
    }

    // Area path closes the shape to the bottom corners
    let areaPath = '';
    if (points.length > 0) {
        // Only the left edge is needed: `V${height} H${startX} Z` closes the
        // shape back along the baseline, so the right edge is implied by the
        // line path's own end point.
        const startX = points.length === 1 ? points[0].cx - 50 : points[0].cx;
        areaPath = `${linePath} V${height} H${startX} Z`;
    }

    return {
        linePath,
        areaPath,
        points
    };
};

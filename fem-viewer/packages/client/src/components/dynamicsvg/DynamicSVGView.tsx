/* Proof of concept for dynamic SVG generation from model data.
   Generated with Claude 3.7 Sonnet.
   Not ready to be used.
*/

import React, { useEffect, useRef, useState } from 'react';
import useFEM from '../../state/useFEM';
import * as d3 from 'd3';
import styles from './dynamicsvg.module.css';
import Header from '../header/Header';
import { Instance, Model, Connector } from '@fem-viewer/types';

// Define proper types for position data to improve type safety
interface Point {
  x: number;
  y: number;
}

interface ControlPoint extends Point {
  index: number;
}

interface PositionData {
  edge?: number;
  sourceEdge?: number;
  targetEdge?: number;
  controlPoints: ControlPoint[];
  middle: Point | null;
  index?: number;
  sourcePoint: Point | null;
  targetPoint: Point | null;
}

// Helper function to clamp a number between min and max
const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

// Helper function to parse connector positions
const parseConnectorPositions = (positionsString: string | undefined, modelName?: string): PositionData | null => {
  if (!positionsString) return null;
  
  try {
    // Initialize result with default values
    const result: PositionData = {
      edge: -1,
      sourceEdge: -1,
      targetEdge: -1,
      controlPoints: [],
      middle: null,
      index: 0,
      sourcePoint: null,
      targetPoint: null
    };
    
    console.log('Parsing position string:', positionsString);

    // Extract edge information - this is critical for gym-example.xml format
    const edgeMatch = positionsString.match(/EDGE\s+(\d+)/);
    if (edgeMatch) {
      result.edge = parseInt(edgeMatch[1], 10);
      result.sourceEdge = result.edge;
    }

    // Extract index value - important for gym-example.xml
    const indexMatch = positionsString.match(/index:(\d+)/);
    if (indexMatch) {
      result.index = parseInt(indexMatch[1], 10);
    }

    // Extract x1/y1 coordinates - primary source point in gym-example.xml
    const x1y1Match = positionsString.match(/x1:(\d+\.?\d*)cm\s+y1:(\d+\.?\d*)cm/);
    if (x1y1Match) {
      result.sourcePoint = {
        x: parseFloat(x1y1Match[1]),
        y: parseFloat(x1y1Match[2])
      };
      console.log('Found source point:', result.sourcePoint);
    }

    // Extract MIDDLE point - critical for gym-example.xml connections
    const middleMatch = positionsString.match(/MIDDLE\s+x:(\d+\.?\d*)cm\s+y:(\d+\.?\d*)cm/);
    if (middleMatch) {
      result.middle = {
        x: parseFloat(middleMatch[1]),
        y: parseFloat(middleMatch[2])
      };
      console.log('Found middle point:', result.middle);

      // Add middle point as a control point
      result.controlPoints.push({
        index: 1,
        x: parseFloat(middleMatch[1]),
        y: parseFloat(middleMatch[2])
      });
    }

    // If we have both source and middle points, ensure proper ordering
    if (result.sourcePoint && result.middle) {
      // Sort control points by index
      result.controlPoints.sort((a, b) => a.index - b.index);
    }

    return result;
  } catch (e) {
    console.warn('Error parsing connector positions:', e);
    return null;
  }
};

// Helper function to calculate anchor point
const calculateAnchorPoint = (
  instance: Instance, 
  edgeValue: number = -1,
  otherPoint: { x: number, y: number },
  specificPoint: { x: number, y: number } | null = null,
  cmToPx: number = 37.7952755906
): { x: number, y: number } => {
  if (!instance.position) {
    return { x: 0, y: 0 }; // Fallback
  }
  
  // If we have a specific point from the position data, use that directly
  if (specificPoint) {
    return { 
      x: specificPoint.x * cmToPx, 
      y: specificPoint.y * cmToPx 
    };
  }
  
  // Convert instance position to pixels
  const x = instance.position.x * cmToPx;
  const y = instance.position.y * cmToPx;
  const width = instance.position.width * cmToPx;
  const height = instance.position.height * cmToPx;
  
  // Calculate center of the instance
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  // For elliptical shapes, calculate the intersection with the ellipse boundary
  if (instance.class && (instance.class.includes('Process') || instance.class.includes('Activity'))) {
    // Calculate the angle to the other point
    const dx = otherPoint.x - centerX;
    const dy = otherPoint.y - centerY;
    const angle = Math.atan2(dy, dx);
    
    // Ellipse radii
    const rx = width / 2;
    const ry = height / 2;
    
    // Calculate point on ellipse boundary using parametric equation
    // x = centerX + rx * cos(angle)
    // y = centerY + ry * sin(angle)
    const px = centerX + rx * Math.cos(angle);
    const py = centerY + ry * Math.sin(angle);
    
    return { x: px, y: py };
  }
  
  // For Pool instances (cloud shape), improve the connection point calculation
  if (instance.class && instance.class.includes('Pool')) {
    // Based on the angle to other point, determine which side to connect to
    const dx = otherPoint.x - centerX;
    const dy = otherPoint.y - centerY;
    const angle = Math.atan2(dy, dx);
    
    // For cloud shapes, we'll use more connection points based on angle octants
    // to better match the cloud's irregular shape
    const angleNormalized = ((angle + Math.PI * 2) % (Math.PI * 2)); // 0 to 2π
    
    // Calculate bubble positions (similar to createCloudPath)
    const bubbleRadius = Math.min(width, height) * 0.2;
    
    // Define key points around the cloud
    const keyPoints = [
      { angle: 0, x: x + width, y: centerY }, // Right
      { angle: Math.PI/4, x: x + width * 0.85, y: y + height * 0.15 }, // Top-right
      { angle: Math.PI/2, x: centerX, y: y }, // Top
      { angle: 3*Math.PI/4, x: x + width * 0.15, y: y + height * 0.15 }, // Top-left
      { angle: Math.PI, x: x, y: centerY }, // Left
      { angle: 5*Math.PI/4, x: x + width * 0.15, y: y + height * 0.85 }, // Bottom-left
      { angle: 3*Math.PI/2, x: centerX, y: y + height }, // Bottom
      { angle: 7*Math.PI/4, x: x + width * 0.85, y: y + height * 0.85 } // Bottom-right
    ];
    
    // Find the closest key point based on angle
    let closestPoint = keyPoints[0];
    let minAngleDiff = Math.PI * 2;
    
    for (const point of keyPoints) {
      const angleDiff = Math.abs(((point.angle - angleNormalized + Math.PI) % (Math.PI * 2)) - Math.PI);
      if (angleDiff < minAngleDiff) {
        minAngleDiff = angleDiff;
        closestPoint = point;
      }
    }
    
    return { x: closestPoint.x, y: closestPoint.y };
  }
  
  // For rectangular shapes, calculate precise edge intersection
  // First check if an edge is specified in the connector data
  if (edgeValue >= 0 && edgeValue <= 3) {
    switch (edgeValue) {
      case 0: // Top edge
        return { 
          x: Math.min(Math.max(otherPoint.x, x), x + width), // Clamp X to rectangle width
          y: y 
        };
      case 1: // Right edge
        return { 
          x: x + width, 
          y: Math.min(Math.max(otherPoint.y, y), y + height) // Clamp Y to rectangle height
        };
      case 2: // Bottom edge
        return { 
          x: Math.min(Math.max(otherPoint.x, x), x + width), // Clamp X to rectangle width
          y: y + height 
        };
      case 3: // Left edge
        return { 
          x: x, 
          y: Math.min(Math.max(otherPoint.y, y), y + height) // Clamp Y to rectangle height
        };
    }
  }
  
  // If no edge value or invalid, calculate the intersection point with the rectangle
  // This calculates which edge of the rectangle is intersected by the line from center to otherPoint
  
  // Vector from center to other point
  const dx = otherPoint.x - centerX;
  const dy = otherPoint.y - centerY;
  
  // Handle the case when the other point is exactly at the center
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    // Default to right edge if points are too close
    return { x: x + width, y: centerY };
  }
  
  // Normalized vector
  const length = Math.sqrt(dx * dx + dy * dy);
  const ndx = dx / length;
  const ndy = dy / length;
  
  // Half dimensions of the rectangle
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  
  // Calculate times of intersection with each edge
  // We're solving for t in the equation: center + t * direction = intersection point
  const txLeft = (x - centerX) / ndx;
  const txRight = (x + width - centerX) / ndx;
  const tyTop = (y - centerY) / ndy;
  const tyBottom = (y + height - centerY) / ndy;
  
  // Filter valid intersections (positive t values)
  const validIntersections = [];
  
  if (Math.abs(ndx) > 0.0001) { // Not vertical line
    if (txLeft > 0) validIntersections.push({t: txLeft, x: x, y: centerY + txLeft * ndy, edge: 3}); // Left edge
    if (txRight > 0) validIntersections.push({t: txRight, x: x + width, y: centerY + txRight * ndy, edge: 1}); // Right edge
  }
  
  if (Math.abs(ndy) > 0.0001) { // Not horizontal line
    if (tyTop > 0) validIntersections.push({t: tyTop, x: centerX + tyTop * ndx, y: y, edge: 0}); // Top edge
    if (tyBottom > 0) validIntersections.push({t: tyBottom, x: centerX + tyBottom * ndx, y: y + height, edge: 2}); // Bottom edge
  }
  
  // Filter intersections that actually fall on the rectangle
  const onRectIntersections = validIntersections.filter(i => 
    i.x >= x - 0.1 && i.x <= x + width + 0.1 && i.y >= y - 0.1 && i.y <= y + height + 0.1
  );
  
  // Find the closest valid intersection
  if (onRectIntersections.length > 0) {
    onRectIntersections.sort((a, b) => a.t - b.t);
    return { x: onRectIntersections[0].x, y: onRectIntersections[0].y };
  }
  
  // Fallback: edge clamping approach
  // Figure out which edge to use based on the direction
  if (Math.abs(ndx) > Math.abs(ndy)) {
    // Primarily horizontal movement
    const edgeX = ndx > 0 ? x + width : x;
    return { x: edgeX, y: clamp(centerY + ndy * Math.abs((edgeX - centerX) / ndx), y, y + height) };
  } else {
    // Primarily vertical movement
    const edgeY = ndy > 0 ? y + height : y;
    return { x: clamp(centerX + ndx * Math.abs((edgeY - centerY) / ndy), x, x + width), y: edgeY };
  }
};

// Helper function to generate connector path
const generateConnectorPath = (
  sourceX: number, 
  sourceY: number, 
  targetX: number, 
  targetY: number,
  positionData: PositionData | null,
  modelName?: string,
  cmToPx: number = 37.7952755906
): string => {
  if (!positionData) {
    return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  }

  let path = `M ${sourceX} ${sourceY}`;

  // If we have a middle point, create a path through it
  if (positionData.middle) {
    const middleX = positionData.middle.x * cmToPx;
    const middleY = positionData.middle.y * cmToPx;
    path += ` L ${middleX} ${middleY}`;
  }

  // Add the target point
  path += ` L ${targetX} ${targetY}`;

  return path;
};

// Instance representation types
interface InstanceStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeLinecap?: 'round' | 'butt' | 'square';
  strokeLinejoin?: 'round' | 'bevel' | 'miter';
  strokeDasharray?: string;
}

interface InstanceShape {
  type: 'rect' | 'ellipse' | 'cloud';
  width: number;
  height: number;
  rx?: number;
  ry?: number;
}

interface InstanceRepresentation {
  shape: InstanceShape;
  style: InstanceStyle;
  getPath?: (x: number, y: number, width: number, height: number) => string;
  getAnchorPoints?: (x: number, y: number, width: number, height: number) => { x: number, y: number }[];
}

// Instance type registry
const instanceTypes: Record<string, InstanceRepresentation> = {
  'Process': {
    shape: {
      type: 'ellipse',
      width: 150,
      height: 60
    },
    style: {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 1,
      strokeLinecap: 'round',
      strokeLinejoin: 'bevel'
    }
  },
  'Pool': {
    shape: {
      type: 'cloud',
      width: 150,
      height: 60
    },
    style: {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 1,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    getPath: (x: number, y: number, width: number, height: number) => {
      // Calculate dimensions and positions for the cloud bubbles
      const bubbleRadius = Math.min(width, height) * 0.2;
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      
      // Create cloud bubbles positions
      const bubbles = [
        { cx: x + bubbleRadius, cy: y + height * 0.3, r: bubbleRadius },
        { cx: x + width * 0.3, cy: y + bubbleRadius, r: bubbleRadius * 0.9 },
        { cx: centerX, cy: y + bubbleRadius, r: bubbleRadius * 1.1 },
        { cx: x + width * 0.7, cy: y + bubbleRadius, r: bubbleRadius * 0.9 },
        { cx: x + width - bubbleRadius, cy: y + height * 0.3, r: bubbleRadius },
        { cx: x + width - bubbleRadius, cy: centerY, r: bubbleRadius * 1.1 },
        { cx: x + width - bubbleRadius, cy: y + height * 0.7, r: bubbleRadius },
        { cx: x + width * 0.7, cy: y + height - bubbleRadius, r: bubbleRadius * 0.9 },
        { cx: centerX, cy: y + height - bubbleRadius, r: bubbleRadius * 1.1 },
        { cx: x + width * 0.3, cy: y + height - bubbleRadius, r: bubbleRadius * 0.9 },
        { cx: x + bubbleRadius, cy: y + height * 0.7, r: bubbleRadius },
        { cx: x + bubbleRadius, cy: centerY, r: bubbleRadius * 1.1 }
      ];
      
      // Create SVG path for the cloud
      let path = `M ${bubbles[0].cx},${bubbles[0].cy}`;
      
      for (let i = 0; i < bubbles.length; i++) {
        const current = bubbles[i];
        const next = bubbles[(i + 1) % bubbles.length];
        
        // Create a curve between current and next bubble
        path += ` A ${current.r},${current.r} 0 0,1 ${(current.cx + next.cx) / 2},${(current.cy + next.cy) / 2}`;
      }
      
      path += ' Z'; // Close the path
      return path;
    }
  },
  'Asset': {
    shape: {
      type: 'rect',
      width: 150,
      height: 60,
      rx: 0,
      ry: 0
    },
    style: {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 1,
      strokeLinecap: 'round',
      strokeLinejoin: 'bevel'
    }
  },
  'Note': {
    shape: {
      type: 'rect',
      width: 150,
      height: 60,
      rx: 0,
      ry: 0
    },
    style: {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 1,
      strokeLinecap: 'round',
      strokeLinejoin: 'bevel'
    }
  }
};

// Helper function to get instance representation
const getInstanceRepresentation = (instance: Instance): InstanceRepresentation => {
  // Default representation for unknown types
  const defaultRep: InstanceRepresentation = {
    shape: {
      type: 'rect',
      width: 150,
      height: 60
    },
    style: {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 1
    }
  };

  // Try to find a matching representation
  if (instance.class) {
    // First try exact match
    if (instanceTypes[instance.class]) {
      return instanceTypes[instance.class];
    }

    // Then try partial match
    for (const [type, rep] of Object.entries(instanceTypes)) {
      if (instance.class.includes(type)) {
        return rep;
      }
    }
  }

  return defaultRep;
};

// Helper function to get color for an instance based on its subclass
const getInstanceColor = (instance: Instance, model: Model | null, subclassColors: Record<string, string>): string => {
  // If this is a Classification model and the instance is a subclass itself
  if (model?.name === 'Classification') {
    // Use the instance's individual background color if available
    if (instance.individualBGColor) {
      return instance.individualBGColor.replace('$', '#');
    }
  }
  
  // Only apply color if the instance has a subclass reference
  if (instance.Interrefs && instance.Interrefs["Referenced Subclass"]) {
    const subclassName = instance.Interrefs["Referenced Subclass"].tobjname;
    
    // Try to get color from our extracted subclass colors
    if (subclassColors[subclassName]) {
      return subclassColors[subclassName];
    }
    
    // Fallback to the instance's referenced color if available
    if (instance.referencedBGColor) {
      return instance.referencedBGColor;
    }
  }
  
  // Default to transparent background for all instances
  return 'transparent';
};

// Helper function to render an instance
const renderInstance = (
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
  instance: Instance,
  x: number,
  y: number,
  width: number,
  height: number,
  isSelected: boolean = false,
  model: Model | null,
  subclassColors: Record<string, string>
): d3.Selection<SVGGElement, unknown, null, undefined> => {
  const rep = getInstanceRepresentation(instance);
  const instanceGroup = svg.append('g')
    .attr('class', `instance ${instance.class || ''}`)
    .attr('data-instance-id', instance.id)
    .attr('data-instance-type', instance.class || 'default');

  // Get fill color based on subclass
  const fillColor = getInstanceColor(instance, model, subclassColors);

  // Apply selection styles if needed
  const style = {
    ...rep.style,
    fill: fillColor,
    stroke: isSelected ? '#007bff' : rep.style.stroke,
    strokeWidth: isSelected ? 2 : rep.style.strokeWidth
  };

  // Create a function to apply optional attributes
  const applyOptionalAttr = (element: d3.Selection<any, unknown, null, undefined>, attr: string, value: any) => {
    if (value !== undefined) {
      element.attr(attr, value);
    }
  };

  // Render the shape based on type
  switch (rep.shape.type) {
    case 'rect': {
      const rect = instanceGroup.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', width)
        .attr('height', height)
        .attr('rx', rep.shape.rx || 0)
        .attr('ry', rep.shape.ry || 0)
        .attr('fill', style.fill)
        .attr('stroke', style.stroke)
        .attr('stroke-width', style.strokeWidth);
      
      applyOptionalAttr(rect, 'stroke-linecap', style.strokeLinecap);
      applyOptionalAttr(rect, 'stroke-linejoin', style.strokeLinejoin);
      applyOptionalAttr(rect, 'stroke-dasharray', style.strokeDasharray);
      break;
    }

    case 'ellipse': {
      const ellipse = instanceGroup.append('ellipse')
        .attr('cx', x + width / 2)
        .attr('cy', y + height / 2)
        .attr('rx', width / 2)
        .attr('ry', height / 2)
        .attr('fill', style.fill)
        .attr('stroke', style.stroke)
        .attr('stroke-width', style.strokeWidth);
      
      applyOptionalAttr(ellipse, 'stroke-linecap', style.strokeLinecap);
      applyOptionalAttr(ellipse, 'stroke-linejoin', style.strokeLinejoin);
      applyOptionalAttr(ellipse, 'stroke-dasharray', style.strokeDasharray);
      break;
    }

    case 'cloud': {
      if (rep.getPath) {
        const path = instanceGroup.append('path')
          .attr('d', rep.getPath(x, y, width, height))
          .attr('fill', style.fill)
          .attr('stroke', style.stroke)
          .attr('stroke-width', style.strokeWidth);
        
        applyOptionalAttr(path, 'stroke-linecap', style.strokeLinecap);
        applyOptionalAttr(path, 'stroke-linejoin', style.strokeLinejoin);
        applyOptionalAttr(path, 'stroke-dasharray', style.strokeDasharray);
      }
      break;
    }
  }

  // Add text label
  if (instance.name) {
    instanceGroup.append('text')
      .attr('x', x + width / 2)
      .attr('y', y + height / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#000000')
      .attr('font-size', '12px')
      .attr('font-family', 'Arial')
      .text(instance.name);
  }

  return instanceGroup;
};

// Connector-related interfaces and types
interface ConnectorStyle {
  color: string;
  dashArray: string;
  markerId: string;
  strokeWidth: number;
}

interface ConnectorLabel {
  sourceName: string;
  targetName: string;
  connectorClass: string;
  position: { x: number; y: number };
}

interface ConnectorPathData {
  sourcePoint: { x: number; y: number };
  targetPoint: { x: number; y: number };
  controlPoints: Array<{ index: number; x: number; y: number }>;
  middle: Point | null;
}

// Connector style registry
const connectorStyles: Record<string, ConnectorStyle> = {
  'Manages': { 
    color: '#3498db', 
    dashArray: 'none',
    markerId: 'manages',
    strokeWidth: 3
  },
  'Used In': { 
    color: '#2ecc71', 
    dashArray: '5,5',
    markerId: 'usedin',
    strokeWidth: 3
  },
  'Is inside': { 
    color: '#e74c3c', 
    dashArray: 'none',
    markerId: 'isinside',
    strokeWidth: 3
  },
  'Drawing/Adding': { 
    color: '#9b59b6', 
    dashArray: '5,2',
    markerId: 'drawingadding',
    strokeWidth: 3
  },
  'default': { 
    color: '#333333', 
    dashArray: 'none',
    markerId: 'default',
    strokeWidth: 2
  }
};

// Helper function to get connector style
const getConnectorStyle = (connectorClass: string): ConnectorStyle => {
  return connectorStyles[connectorClass] || connectorStyles.default;
};

// Helper function to create connector label
const createConnectorLabel = (
  source: Instance,
  target: Instance,
  connector: Connector,
  position: { x: number; y: number }
): ConnectorLabel => {
  const sourceDisplayName = source.name && source.name.length > 10 
    ? source.name.substring(0, 10) + '...' 
    : (source.name || '[No Name]');
  
  const targetDisplayName = target.name && target.name.length > 10 
    ? target.name.substring(0, 10) + '...' 
    : (target.name || '[No Name]');
  
  return {
    sourceName: sourceDisplayName,
    targetName: targetDisplayName,
    connectorClass: connector.class || 'Connection',
    position
  };
};

// Helper function to render connector label
const renderConnectorLabel = (
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  label: ConnectorLabel,
  style: ConnectorStyle
): void => {
  const labelGroup = container.append('g')
    .attr('class', 'connector-label')
    .attr('transform', `translate(${label.position.x}, ${label.position.y})`);
  
  // Add background
  labelGroup.append('rect')
    .attr('x', -70)
    .attr('y', -10)
    .attr('width', 140)
    .attr('height', 20)
    .attr('fill', 'white')
    .attr('stroke', style.color)
    .attr('stroke-width', 1)
    .attr('rx', 5)
    .attr('ry', 5);
  
  // Add connection text
  labelGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '10px')
    .attr('fill', 'black')
    .text(`${label.sourceName} → ${label.targetName}`);
  
  // Add relationship type
  labelGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '8px')
    .attr('fill', '#666')
    .attr('y', 10)
    .text(`(${label.connectorClass})`);
};

// Helper function to render connector path
const renderConnectorPath = (
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  pathData: ConnectorPathData,
  style: ConnectorStyle,
  modelName?: string
): void => {
  const pathString = generateConnectorPath(
    pathData.sourcePoint.x,
    pathData.sourcePoint.y,
    pathData.targetPoint.x,
    pathData.targetPoint.y,
    pathData,
    modelName
  );
  
  container.append('path')
    .attr('d', pathString)
    .attr('stroke', style.color)
    .attr('stroke-width', style.strokeWidth)
    .attr('marker-end', `url(#arrowhead-${style.markerId})`)
    .attr('class', 'connector-path')
    .attr('fill', 'none')
    .attr('stroke-dasharray', style.dashArray);
};

// Helper function to render a single connector
const renderConnector = (
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  connector: Connector,
  source: Instance,
  target: Instance,
  modelName: string,
  cmToPx: number
): void => {
  // Create connector container
  const connectorContainer = container.append('g')
    .attr('class', `connector ${connector.class || ''}`)
    .attr('data-connector-id', connector.id)
    .attr('data-source-id', source.id)
    .attr('data-target-id', target.id)
    .attr('data-connector-type', connector.class || 'default');
  
  // Get connector style
  const style = getConnectorStyle(connector.class || 'default');
  
  // Parse connector positions
  const positionData = parseConnectorPositions(connector.positions, modelName);
  
  // Calculate anchor points
  const sourcePoint = calculateAnchorPoint(
    source,
    positionData?.sourceEdge ?? -1,
    { x: target.position!.x * cmToPx + (target.position!.width * cmToPx / 2),
      y: target.position!.y * cmToPx + (target.position!.height * cmToPx / 2) },
    positionData?.sourcePoint
  );
  
  const targetPoint = calculateAnchorPoint(
    target,
    positionData?.targetEdge ?? -1,
    { x: source.position!.x * cmToPx + (source.position!.width * cmToPx / 2),
      y: source.position!.y * cmToPx + (source.position!.height * cmToPx / 2) },
    positionData?.targetPoint
  );
  
  // Create path data
  const pathData: ConnectorPathData = {
    sourcePoint,
    targetPoint,
    controlPoints: positionData?.controlPoints || [],
    middle: positionData?.middle || null
  };
  
  // Render connector path
  renderConnectorPath(connectorContainer, pathData, style, modelName);
  
  // Calculate label position
  const labelPosition = calculateLabelPosition(pathData, cmToPx);
  
  // Create and render label
  const label = createConnectorLabel(source, target, connector, labelPosition);
  renderConnectorLabel(connectorContainer, label, style);
  
  // Add tooltip
  connectorContainer.append('title')
    .text(`${label.connectorClass} connector from ${source.name || '[No Name]'} to ${target.name || '[No Name]'}`);
};

// Helper function to calculate label position
const calculateLabelPosition = (pathData: ConnectorPathData, cmToPx: number): { x: number; y: number } => {
  let midX, midY;
  
  if (pathData.middle) {
    midX = pathData.middle.x * cmToPx;
    midY = pathData.middle.y * cmToPx;
  } else if (pathData.controlPoints.length > 0) {
    const middleIndex = Math.floor(pathData.controlPoints.length / 2);
    midX = pathData.controlPoints[middleIndex].x * cmToPx;
    midY = pathData.controlPoints[middleIndex].y * cmToPx;
  } else {
    const pathMidX = (pathData.sourcePoint.x + pathData.targetPoint.x) / 2;
    const pathMidY = (pathData.sourcePoint.y + pathData.targetPoint.y) / 2;
    
    const dx = pathData.targetPoint.x - pathData.sourcePoint.x;
    const dy = pathData.targetPoint.y - pathData.sourcePoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length > 0) {
      const offsetX = -dy / length * 15;
      const offsetY = dx / length * 15;
      midX = pathMidX + offsetX;
      midY = pathMidY + offsetY;
    } else {
      midX = pathMidX;
      midY = pathMidY;
    }
  }
  
  return { x: midX, y: midY };
};

const DynamicSVGView: React.FC = () => {
  const { getCurrentModel, getZoom, setCurrentInstance, getCurrentInstance, state } = useFEM();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgGenerated, setSvgGenerated] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(1);
  const [subclassColors, setSubclassColors] = useState<Record<string, string>>({});
  const [validConnectors, setValidConnectors] = useState<number>(0);
  const [invalidConnectors, setInvalidConnectors] = useState<number>(0);
  const [debug, setDebug] = useState<string>('');
  const [debugOptions, setDebugOptions] = useState<string[]>([]);
  
  const model = getCurrentModel();
  const zoom = getZoom();
  const currentInstance = getCurrentInstance();
  
  // Convert cm to pixels
  const cmToPx = 37.7952755906;
  
  // Extract subclass colors from the Classification model
  useEffect(() => {
    const classificationModel = state.models.find((m: Model) => m.name === 'Classification');
    if (!classificationModel) return;
    
    const colors: Record<string, string> = {};
    
    classificationModel.instances.forEach(instance => {
      // Extract color from the instance
      if (instance.position) {
        // Use the instance's individual background color if available
        if (instance.individualBGColor) {
          const color = instance.individualBGColor.replace('$', '#');
          colors[instance.name] = color;
        }
      }
    });
    
    setSubclassColors(colors);
    console.log('Extracted subclass colors:', colors);
  }, [state.models]);
  
  // Function to get color for an instance based on its subclass
  const getInstanceColor = (instance: Instance): string => {
    // If this is a Classification model and the instance is a subclass itself
    if (model?.name === 'Classification') {
      // Use the instance's individual background color if available
      if (instance.individualBGColor) {
        return instance.individualBGColor.replace('$', '#');
      }
    }
    
    // Only apply color if the instance has a subclass reference
    if (instance.Interrefs && instance.Interrefs["Referenced Subclass"]) {
      const subclassName = instance.Interrefs["Referenced Subclass"].tobjname;
      
      // Try to get color from our extracted subclass colors
      if (subclassColors[subclassName]) {
        return subclassColors[subclassName];
      }
      
      // Fallback to the instance's referenced color if available
      if (instance.referencedBGColor) {
        return instance.referencedBGColor;
      }
    }
    
    // Default to transparent background for all instances
    return 'transparent';
  };
  
  // Function to create a cloud path for Pool instances
  const createCloudPath = (x: number, y: number, width: number, height: number): string => {
    // Calculate dimensions and positions for the cloud bubbles
    const bubbleRadius = Math.min(width, height) * 0.2;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // Create cloud bubbles positions
    const bubbles = [
      { cx: x + bubbleRadius, cy: y + height * 0.3, r: bubbleRadius },
        { cx: x + width * 0.3, cy: y + bubbleRadius, r: bubbleRadius * 0.9 },
        { cx: centerX, cy: y + bubbleRadius, r: bubbleRadius * 1.1 },
        { cx: x + width * 0.7, cy: y + bubbleRadius, r: bubbleRadius * 0.9 },
        { cx: x + width - bubbleRadius, cy: y + height * 0.3, r: bubbleRadius },
        { cx: x + width - bubbleRadius, cy: centerY, r: bubbleRadius * 1.1 },
        { cx: x + width - bubbleRadius, cy: y + height * 0.7, r: bubbleRadius },
        { cx: x + width * 0.7, cy: y + height - bubbleRadius, r: bubbleRadius * 0.9 },
        { cx: centerX, cy: y + height - bubbleRadius, r: bubbleRadius * 1.1 },
        { cx: x + width * 0.3, cy: y + height - bubbleRadius, r: bubbleRadius * 0.9 },
        { cx: x + bubbleRadius, cy: y + height * 0.7, r: bubbleRadius },
        { cx: x + bubbleRadius, cy: centerY, r: bubbleRadius * 1.1 }
    ];
    
    // Create SVG path for the cloud
    let path = `M ${bubbles[0].cx},${bubbles[0].cy}`;
    
    for (let i = 0; i < bubbles.length; i++) {
      const current = bubbles[i];
      const next = bubbles[(i + 1) % bubbles.length];
      
      // Create a curve between current and next bubble
      path += ` A ${current.r},${current.r} 0 0,1 ${(current.cx + next.cx) / 2},${(current.cy + next.cy) / 2}`;
    }
    
    path += ' Z'; // Close the path
    return path;
  };
  
  // Function to handle instance click
  const handleInstanceClick = (instance: Instance) => {
    setCurrentInstance(instance);
  };
  
  // Check if an instance is the currently selected one
  const isCurrentInstance = (instance: Instance): boolean => {
    return currentInstance?.id === instance.id;
  };
  
  // Function to find instance by ID or try to match by name 
  const findInstanceById = (model: Model, instanceId: string): Instance | undefined => {
    // Try to find the instance by ID first
    let instance = model.instances.find(inst => inst.id === instanceId);
    
    // If not found by ID, try to extract name from ID and find by name
    if (!instance) {
      // First try to find by name if the ID might be a name
      let nameCandidate = instanceId
        .replace(/[-_][0-9]+$/, '') // Remove trailing numbers with dash/underscore
        .replace(/^[A-Za-z]+_/, ''); // Remove leading class prefix with underscore
      
      // Find by full name or partial name match
      instance = model.instances.find(inst => 
        inst.name === instanceId || 
        inst.name === nameCandidate ||
        (inst.name && instanceId.includes(inst.name)) ||
        (inst.name && nameCandidate.includes(inst.name))
      );
      
      // If still not found, try more aggressive matching
      if (!instance) {
        const idParts = instanceId.split(/[-_]/);
        
        // If the ID has multiple parts, try to match using each part
        if (idParts.length > 1) {
          const nameParts = idParts.filter(part => isNaN(Number(part)) && part.length > 2);
          
          // Try to find by any significant name part
          for (const namePart of nameParts) {
            const matchingInstances = model.instances.filter(inst => 
              inst.name && inst.name.includes(namePart)
            );
            
            if (matchingInstances.length === 1) {
              // If exactly one match, use it
              instance = matchingInstances[0];
              break;
            } else if (matchingInstances.length > 1) {
              // If multiple matches, try to find the best one
              // Prefer exact class matches if available
              const className = idParts[0]; // First part is often the class
              const classMatches = matchingInstances.filter(inst => 
                inst.class && inst.class.includes(className)
              );
              
              if (classMatches.length > 0) {
                // Just take the first class match if multiple
                instance = classMatches[0];
                break;
              } else {
                // Take the first match if no class match
                instance = matchingInstances[0];
                break;
              }
            }
          }
        }
        
        // As a last resort, try to match by class if there's only one instance of that class
        if (!instance && idParts.length > 0) {
          const className = idParts[0]; // First part is often the class
          const classInstances = model.instances.filter(inst => 
            inst.class && inst.class.toLowerCase().includes(className.toLowerCase())
          );
          
          if (classInstances.length === 1) {
            instance = classInstances[0];
          }
        }
      }
    }
    
    return instance;
  };
  
  // Function to find all valid connectors (with existing source and target instances)
  const getValidConnectors = (model: Model): { 
    valid: Array<{ connector: Connector, source: Instance, target: Instance }>, 
    invalid: number 
  } => {
    const validConnectors: Array<{ connector: Connector, source: Instance, target: Instance }> = [];
    let invalidCount = 0;
    let debugInfo = [];
    
    // Log model info
    console.log(`Processing model ${model.name} with ${model.instances.length} instances and ${model.connectors.length} connectors`);
    debugInfo.push(`Model: ${model.name} (${model.instances.length} instances, ${model.connectors.length} connectors)`);
    
    // Additional debug for "From having a gym" model
    if (model.name === "From having a gym") {
      console.log('Special handling for "From having a gym" model:');
      console.log('Instance IDs:', model.instances.map(i => i.id).join(', '));
      console.log('Connector fromIDs:', model.connectors.map(c => c.fromId).join(', '));
      console.log('Connector toIDs:', model.connectors.map(c => c.toId).join(', '));
    }
    
    // Create maps for faster lookups
    const instanceMap = new Map<string, Instance>();
    model.instances.forEach(instance => {
      instanceMap.set(instance.id, instance);
      // Also map by name for easier lookup
      if (instance.name) {
        instanceMap.set(instance.name, instance);
      }
    });
    
    // Additional mappings for the particular model
    if (model.name === "From having a gym") {
      // Sometimes the ID and the name are different, so map both
      model.instances.forEach(instance => {
        if (instance.name) {
          const simplifiedName = instance.name
            .replace(/\s+/g, '')  // Remove spaces
            .replace(/[^a-zA-Z0-9]/g, ''); // Remove special chars
          
          instanceMap.set(simplifiedName, instance);
          
          // Also map by class_name pattern
          if (instance.class) {
            instanceMap.set(`${instance.class}_${instance.name}`, instance);
            instanceMap.set(`${instance.class}-${instance.name}`, instance);
          }
        }
      });
    }
    
    model.connectors.forEach(connector => {
      // Try our enhanced lookup
      let source = findInstanceById(model, connector.fromId);
      let target = findInstanceById(model, connector.toId);
      
      // Special case for "From having a gym" model
      if (model.name === "From having a gym") {
        console.log(`Looking for connector ${connector.id} from "${connector.fromId}" to "${connector.toId}"`);
        
        if (!source) {
          console.log(`Could not find source instance for "${connector.fromId}"`);
          
          // Try all possible mappings by logging all possibilities
          model.instances.forEach(instance => {
            const similarity = levenshteinDistance(connector.fromId, instance.id);
            console.log(`- Candidate: ${instance.id} (${instance.name}) - Similarity: ${similarity}`);
          });
        }
        
        if (!target) {
          console.log(`Could not find target instance for "${connector.toId}"`);
          
          // Try all possible mappings
          model.instances.forEach(instance => {
            const similarity = levenshteinDistance(connector.toId, instance.id);
            console.log(`- Candidate: ${instance.id} (${instance.name}) - Similarity: ${similarity}`);
          });
        }
      }
      
      // Log attempts for debugging
      debugInfo.push(`Connector ${connector.id} from ${connector.fromId} to ${connector.toId}: ${source ? 'Source found' : 'Source missing'}, ${target ? 'Target found' : 'Target missing'}`);
      
      if (source && target && source.position && target.position) {
        validConnectors.push({ connector, source, target });
      } else {
        invalidCount++;
        
        // More detailed logging
        if (!source) console.warn(`Source instance not found: ${connector.fromId}`);
        if (!target) console.warn(`Target instance not found: ${connector.toId}`);
        if (source && !source.position) console.warn(`Source instance has no position: ${connector.fromId}`);
        if (target && !target.position) console.warn(`Target instance has no position: ${connector.toId}`);
      }
    });
    
    // Update debug state
    setDebug(debugInfo.join('\n'));
    
    // Add this to log positions data for debugging
    validConnectors.forEach(({ connector }) => {
      let positionData = parseConnectorPositions(connector.positions);
      if (positionData) {
        console.log(`Connector ${connector.id} position data:`, positionData);
      }
    });
    
    return { valid: validConnectors, invalid: invalidCount };
  };
  
  // Helper function to calculate string similarity
  const levenshteinDistance = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix: number[][] = [];
    
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // Substitution
            matrix[i][j - 1] + 1,     // Insertion
            matrix[i - 1][j] + 1      // Deletion
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  };
  
  // Main function to generate SVG from model
  const generateSVGFromModel = (model: Model, svgElement: SVGSVGElement, zoom: number) => {
    console.log('Generating SVG from model:', model);
    console.log('Model has connectors:', model.connectors.length);
    
    // Fix viewBox issue
    if (model?.name === "Classification" && model.attributes.worldArea) {
      // Get the SVG dimensions from the Classification model SVG
      const width = 792;
      const height = 1121;
      
      // Create a complete WorldArea object with required properties
      model.attributes.worldArea = { 
        width: width / cmToPx, 
        height: height / cmToPx,
        minWidth: 0,
        minHeight: 0
      };
    }
    
    // Filter for valid connectors
    const { valid: validConnectors, invalid: invalidCount } = getValidConnectors(model);
    setValidConnectors(validConnectors.length);
    setInvalidConnectors(invalidCount);
    
    console.log(`Found ${validConnectors.length} valid connectors and ${invalidCount} invalid connectors`);
    
    // Get the SVG dimensions from the model's world area or use defaults
    const modelWidth = (model.attributes.worldArea?.width || 1000) * cmToPx;
    const modelHeight = (model.attributes.worldArea?.height || 1000) * cmToPx;
    
    // Get container dimensions
    const containerWidth = containerRef.current?.clientWidth || modelWidth;
    const containerHeight = containerRef.current?.clientHeight || modelHeight;
    
    // Create the D3 selection for the SVG element
    const svg = d3.select(svgElement)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${modelWidth} ${modelHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    
    // Create a group for the entire content that will be transformed by zoom
    const rootGroup = svg.append('g')
      .attr('class', 'root-group');
    
    // Create a background rectangle
    rootGroup.append('rect')
      .attr('width', modelWidth)
      .attr('height', modelHeight)
      .attr('fill', 'white');
    
    // Create a defs section for arrow markers and connector styling
    const defs = svg.append('defs');
    
    // Add different arrow marker definitions for different connector types
    Object.entries(connectorStyles).forEach(([type, style]) => {
      defs.append('marker')
        .attr('id', `arrowhead-${style.markerId}`)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 8)
        .attr('refY', 5)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
        .attr('fill', style.color);
    });
    
    // Draw instances first to ensure connectors appear on top
    const instanceGroup = rootGroup.append('g')
      .attr('class', 'instances');
    
    // Create a map of instance IDs for faster lookup
    const instanceMap = new Map<string, { element: d3.Selection<SVGGElement, unknown, null, undefined>, instance: Instance }>();
    
    model.instances.forEach(instance => {
      if (!instance.position) return;
      
      // Calculate position and dimensions
      const x = instance.position.x * cmToPx;
      const y = instance.position.y * cmToPx;
      const width = instance.position.width * cmToPx;
      const height = instance.position.height * cmToPx;
      
      // Check if this is the current instance
      const isCurrent = isCurrentInstance(instance);
      
      // Render the instance using our helper function
      const instanceElement = renderInstance(instanceGroup, instance, x, y, width, height, isCurrent, model, subclassColors);
      
      // Store the instance element in our map
      instanceMap.set(instance.id, { element: instanceElement, instance });
      
      // Add click handler
      instanceElement.on('click', (event) => {
        event.stopPropagation(); // Prevent zoom behavior from interfering
        handleInstanceClick(instance);
      });
    });
    
    // Now draw connectors on top of instances
    const connectorGroup = rootGroup.append('g')
      .attr('class', 'connectors')
      .attr('fill', 'none')
      .style('pointer-events', 'none'); // Prevent connectors from blocking instance clicks
    
    // Render all valid connectors using our new modular system
    validConnectors.forEach(({ connector, source, target }) => {
      renderConnector(connectorGroup, connector, source, target, model.name, cmToPx);
    });
    
    // Add zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5]) // Min and max zoom scale
      .on('zoom', (event) => {
        rootGroup.attr('transform', event.transform);
        setCurrentZoom(event.transform.k);
      });
    
    // Apply zoom behavior to the SVG
    svg.call(zoomBehavior)
      .on('dblclick.zoom', null); // Disable double-click zoom
    
    // Set initial zoom level
    svg.call(zoomBehavior.transform, d3.zoomIdentity.scale(zoom));
    
    // Get the formatted date for timestamps in the status bar
    const formattedDate = new Date().toLocaleString();
    
    // Create a debug log div at the bottom
    if (invalidCount > 0) {
      rootGroup.append('g')
        .attr('class', 'debug-info')
        .attr('transform', `translate(10, ${modelHeight - 120})`)
        .append('text')
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text(`Debug: ${formattedDate} - Found ${validConnectors.length} valid and ${invalidCount} invalid connectors`);
    }
    
    setSvgGenerated(true);
  };
  
  // Reset zoom to fit the entire model
  const resetZoom = () => {
    if (!svgRef.current || !model) return;
    
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5]);
    
    svg.call(zoomBehavior.transform, d3.zoomIdentity.scale(1));
    setCurrentZoom(1);
  };
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (model && svgRef.current) {
        // Regenerate SVG on window resize
        d3.select(svgRef.current).selectAll('*').remove();
        generateSVGFromModel(model, svgRef.current, currentZoom);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [model, currentZoom]);
  
  useEffect(() => {
    if (model && svgRef.current) {
      // Clear any existing content
      d3.select(svgRef.current).selectAll('*').remove();
      
      // Generate SVG from model
      generateSVGFromModel(model, svgRef.current, zoom);
    }
  }, [model, zoom, subclassColors, currentInstance]);
  
  const toggleDebugOption = (option: string) => {
    setDebugOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option) 
        : [...prev, option]
    );
  };
  
  return (
    <div className={styles['dynamicsvg-container']}>
      <Header>
        <div className={styles['header-content']}>
          <div>Dynamic SVG View (D3.js)</div>
          <div className={styles['zoom-controls']}>
            <button 
              className={styles['zoom-button']} 
              onClick={resetZoom}
              title="Reset Zoom"
            >
              Reset View
            </button>
            <span className={styles['zoom-level']}>
              Zoom: {Math.round(currentZoom * 100)}%
            </span>
            
            {/* Debug controls */}
            <button
              className={`${styles['debug-button']} ${debugOptions.includes('Show anchor points') ? styles['active'] : ''}`}
              onClick={() => toggleDebugOption('Show anchor points')}
              title="Show connection anchor points"
            >
              Debug Points
            </button>
          </div>
        </div>
      </Header>
      
      <div className={styles['svg-container']} ref={containerRef}>
        {model ? (
          <svg 
            ref={svgRef} 
            className={styles['svg-element']}
          />
        ) : (
          <div className={styles['no-model']}>No model selected</div>
        )}
      </div>
      
      <div className={styles['status-bar']}>
        {svgGenerated ? 'SVG Generated from Model Data' : 'Waiting for model...'}
        {model && ` - Model: ${model.name} - ${model.instances.length} instances`}
        {validConnectors > 0 && `, ${validConnectors} connectors rendered`}
        {invalidConnectors > 0 && `, ${invalidConnectors} invalid connectors skipped`}
        {Object.keys(subclassColors).length > 0 && ` - ${Object.keys(subclassColors).length} subclass colors loaded`}
        {currentInstance && ` - Selected: ${currentInstance.name}`}
      </div>
    </div>
  );
};

export default DynamicSVGView; 
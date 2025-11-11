/**
 * MCP Tool Result Type
 * Standard return type for all MCP tools
 */

export type MCPContentItem = 
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image";
      data: string;
      mimeType: string;
    };

export interface MCPToolResult {
  content: MCPContentItem[];
  isError?: boolean;
  [key: string]: unknown;
}


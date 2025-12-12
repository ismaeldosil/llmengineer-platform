import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface MarkdownContentProps {
  content: string;
  baseStyle?: object;
}

type ParsedSegment =
  | { type: 'text'; content: string }
  | { type: 'bold'; content: string }
  | { type: 'code'; content: string }
  | { type: 'codeBlock'; content: string; language?: string };

type TableCell = {
  content: ParsedSegment[];
  isHeader: boolean;
};

type TableRow = TableCell[];

type ParsedBlock =
  | { type: 'paragraph'; segments: ParsedSegment[] }
  | { type: 'bulletList'; items: ParsedSegment[][] }
  | { type: 'numberedList'; items: ParsedSegment[][] }
  | { type: 'codeBlock'; content: string; language?: string }
  | { type: 'table'; rows: TableRow[] };

function parseInlineMarkdown(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Check for inline code first (single backticks)
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      segments.push({ type: 'code', content: codeMatch[1] ?? '' });
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Check for bold (**text**)
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      segments.push({ type: 'bold', content: boldMatch[1] ?? '' });
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Find next special character
    const nextSpecial = remaining.search(/\*\*|`/);
    if (nextSpecial === -1) {
      // No more special characters
      segments.push({ type: 'text', content: remaining });
      break;
    } else if (nextSpecial === 0) {
      // Special char at start but didn't match pattern, treat as text
      segments.push({ type: 'text', content: remaining[0] ?? '' });
      remaining = remaining.slice(1);
    } else {
      // Text before special character
      segments.push({ type: 'text', content: remaining.slice(0, nextSpecial) });
      remaining = remaining.slice(nextSpecial);
    }
  }

  return segments;
}

function isTableSeparatorRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return false;
  const cells = trimmed.slice(1, -1).split('|');
  return cells.every((cell) => /^[\s-:]+$/.test(cell));
}

function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|');
}

function parseTableRow(line: string, isHeader: boolean): TableRow {
  const trimmed = line.trim();
  const cellsContent = trimmed.slice(1, -1).split('|');
  return cellsContent.map((cell) => ({
    content: parseInlineMarkdown(cell.trim()),
    isHeader,
  }));
}

function parseMarkdown(content: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line === undefined) {
      i++;
      continue;
    }

    // Check for table
    if (isTableRow(line)) {
      const nextLine = lines[i + 1];
      if (nextLine && isTableSeparatorRow(nextLine)) {
        const rows: TableRow[] = [];
        // Parse header row
        rows.push(parseTableRow(line, true));
        i += 2; // Skip header and separator
        // Parse body rows
        while (i < lines.length) {
          const currentLine = lines[i];
          if (currentLine === undefined || !isTableRow(currentLine)) break;
          rows.push(parseTableRow(currentLine, false));
          i++;
        }
        blocks.push({ type: 'table', rows });
        continue;
      }
    }

    // Check for code block (```)
    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length) {
        const currentLine = lines[i];
        if (currentLine === undefined || currentLine.trim().startsWith('```')) {
          break;
        }
        codeLines.push(currentLine);
        i++;
      }
      blocks.push({
        type: 'codeBlock',
        content: codeLines.join('\n'),
        language: language || undefined,
      });
      i++; // Skip closing ```
      continue;
    }

    // Check for bullet list item
    if (line.trim().startsWith('- ')) {
      const items: ParsedSegment[][] = [];
      while (i < lines.length) {
        const currentLine = lines[i];
        if (currentLine === undefined || !currentLine.trim().startsWith('- ')) {
          break;
        }
        const itemText = currentLine.trim().slice(2);
        items.push(parseInlineMarkdown(itemText));
        i++;
      }
      blocks.push({ type: 'bulletList', items });
      continue;
    }

    // Check for numbered list item
    const numberedMatch = line.trim().match(/^\d+\.\s+(.*)$/);
    if (numberedMatch) {
      const items: ParsedSegment[][] = [];
      while (i < lines.length) {
        const currentLine = lines[i];
        if (currentLine === undefined) break;
        const numMatch = currentLine.trim().match(/^\d+\.\s+(.*)$/);
        if (!numMatch) break;
        items.push(parseInlineMarkdown(numMatch[1] ?? ''));
        i++;
      }
      blocks.push({ type: 'numberedList', items });
      continue;
    }

    // Empty line - skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Regular paragraph - collect consecutive non-empty lines
    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const currentLine = lines[i];
      if (currentLine === undefined) break;
      if (
        currentLine.trim() === '' ||
        currentLine.trim().startsWith('```') ||
        currentLine.trim().startsWith('- ') ||
        currentLine.trim().match(/^\d+\.\s+/)
      ) {
        break;
      }
      paragraphLines.push(currentLine);
      i++;
    }

    if (paragraphLines.length > 0) {
      const paragraphText = paragraphLines.join('\n');
      blocks.push({
        type: 'paragraph',
        segments: parseInlineMarkdown(paragraphText),
      });
    }
  }

  return blocks;
}

function renderSegments(segments: ParsedSegment[], baseTextStyle: object) {
  return segments.map((segment, index) => {
    switch (segment.type) {
      case 'bold':
        return (
          <Text key={index} style={[baseTextStyle, styles.bold]}>
            {segment.content}
          </Text>
        );
      case 'code':
        return (
          <Text key={index} style={styles.inlineCode}>
            {segment.content}
          </Text>
        );
      case 'text':
      default:
        return (
          <Text key={index} style={baseTextStyle}>
            {segment.content}
          </Text>
        );
    }
  });
}

export function MarkdownContent({ content, baseStyle = {} }: MarkdownContentProps) {
  const blocks = useMemo(() => parseMarkdown(content), [content]);
  const baseTextStyle = { ...styles.text, ...baseStyle };

  return (
    <View style={styles.container}>
      {blocks.map((block, blockIndex) => {
        switch (block.type) {
          case 'codeBlock':
            return (
              <View key={blockIndex} style={styles.codeBlock}>
                {block.language && <Text style={styles.codeLanguage}>{block.language}</Text>}
                <Text style={styles.codeText}>{block.content}</Text>
              </View>
            );

          case 'bulletList':
            return (
              <View key={blockIndex} style={styles.list}>
                {block.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.listItem}>
                    <Text style={styles.bullet}>{'\u2022'}</Text>
                    <Text style={[baseTextStyle, styles.listItemText]}>
                      {renderSegments(item, baseTextStyle)}
                    </Text>
                  </View>
                ))}
              </View>
            );

          case 'numberedList':
            return (
              <View key={blockIndex} style={styles.list}>
                {block.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.listItem}>
                    <Text style={styles.number}>{itemIndex + 1}.</Text>
                    <Text style={[baseTextStyle, styles.listItemText]}>
                      {renderSegments(item, baseTextStyle)}
                    </Text>
                  </View>
                ))}
              </View>
            );

          case 'table':
            return (
              <View key={blockIndex} style={styles.tableContainer}>
                {block.rows.map((row, rowIndex) => (
                  <View
                    key={rowIndex}
                    style={[
                      styles.tableRow,
                      rowIndex === 0 && styles.tableHeaderRow,
                      rowIndex % 2 === 1 && styles.tableRowAlt,
                    ]}
                  >
                    {row.map((cell, cellIndex) => (
                      <View
                        key={cellIndex}
                        style={[styles.tableCell, cellIndex === 0 && styles.tableCellFirst]}
                      >
                        <Text
                          style={[
                            baseTextStyle,
                            styles.tableCellText,
                            cell.isHeader && styles.tableHeaderText,
                          ]}
                        >
                          {renderSegments(cell.content, baseTextStyle)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            );

          case 'paragraph':
          default:
            return (
              <Text key={blockIndex} style={[baseTextStyle, styles.paragraph]}>
                {renderSegments(block.segments, baseTextStyle)}
              </Text>
            );
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  text: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 26,
  },
  paragraph: {
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
    color: '#F9FAFB',
  },
  inlineCode: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', web: 'monospace' }),
    fontSize: 14,
    backgroundColor: '#374151',
    color: '#F472B6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeBlock: {
    backgroundColor: '#0D1117',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  codeLanguage: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  codeText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', web: 'monospace' }),
    fontSize: 14,
    color: '#E6EDF3',
    lineHeight: 22,
  },
  list: {
    marginVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#3B82F6',
    width: 20,
    marginRight: 8,
  },
  number: {
    fontSize: 16,
    color: '#3B82F6',
    width: 24,
    marginRight: 8,
    fontWeight: '600',
  },
  listItemText: {
    flex: 1,
  },
  tableContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
    marginVertical: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tableHeaderRow: {
    backgroundColor: '#1F2937',
  },
  tableRowAlt: {
    backgroundColor: '#111827',
  },
  tableCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#374151',
  },
  tableCellFirst: {
    borderLeftWidth: 0,
  },
  tableCellText: {
    fontSize: 14,
  },
  tableHeaderText: {
    fontWeight: '700',
    color: '#F9FAFB',
  },
});

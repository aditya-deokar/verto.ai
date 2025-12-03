'use client'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { useSlideStore } from '@/store/useSlideStore'
import { cn } from '@/lib/utils'
import React, { useEffect, useState } from 'react'

interface TableComponentProps {
    content: string[][]
    onChange: (newContent: string[][]) => void
    isPreview?: boolean
    isEditable?: boolean
    initialRowSize?: number
    initialColSize?: number
}
const TableComponent = ({ content, onChange, initialColSize, initialRowSize, isEditable, isPreview }: TableComponentProps) => {

    const { currentTheme } = useSlideStore()
    const [colSizes, setColSizes] = useState<number[]>([])
    const [rowSizes, setRowSizes] = useState<number[]>([])
    const [tableData, setTableData] = useState<string[][]>(() => {
        if (content.length === 0 || content[0].length === 0) {
            return Array(initialRowSize || 2).fill(Array(initialColSize || 2).fill(''))
        }

        return content
    });

    const handleResizeCol = (index: number, newSize: number) => {
        if (!isEditable) return

        const newSizes = [...colSizes]
        newSizes[index] = newSize
        setColSizes(newSizes)
    }

    const updateCell = (rowIndex: number, cellIndex: number, value: string) => {
        if (!isEditable) return

        const newData = tableData.map((row, rIndex) => (
            rIndex === rowIndex ? row.map((cell, cIndex) => (cIndex === cellIndex ? value : cell)) : row
        ))

        setTableData(newData)
        onChange(newData)
    }


    useEffect(() => {
        if (tableData.length > 0) {
            setRowSizes(new Array(tableData.length).fill(100 / tableData.length))
            setColSizes(new Array(tableData[0].length).fill(100 / tableData[0].length))
        }
    }, [tableData])



    if (isPreview) {
        return (
            <div className='w-full h-full overflow-hidden rounded-lg border border-opacity-20' style={{ borderColor: currentTheme.fontColor }}>
                <table className='w-full h-full border-collapse'>
                    <tbody>
                        {tableData.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                style={{ height: `${rowSizes[rowIndex]}%` }}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}
                                        className='p-2 border border-opacity-20 text-xs'
                                        style={{
                                            width: `${colSizes[cellIndex]}%`,
                                            borderColor: currentTheme.fontColor,
                                            color: currentTheme.fontColor
                                        }}
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <div className='w-full h-full relative rounded-lg overflow-hidden shadow-xs'
            style={{
                // background:currentTheme.gradientBackground || currentTheme.backgroundColor,
            }}
        >
            <ResizablePanelGroup
                direction='vertical'
                className={cn(
                    'h-full w-full rounded-lg border border-opacity-20',
                    !isEditable && 'border-0'
                )}
                style={{ borderColor: currentTheme.fontColor }}
                onLayout={(sizes) => setRowSizes(sizes)}
            >

                {tableData.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {rowIndex > 0 && <ResizableHandle className="bg-gray-300/50" />}

                        <ResizablePanel
                            defaultSize={rowSizes[rowIndex]}
                            className="h-full"
                        >
                            <ResizablePanelGroup direction='horizontal'
                                className='w-full h-full'
                                onLayout={(sizes) => setColSizes(sizes)}
                            >
                                {row.map((cell, cellIndex) => (
                                    <React.Fragment key={cellIndex}>
                                        {cellIndex > 0 && <ResizableHandle className="bg-gray-300/50" />}

                                        <ResizablePanel
                                            defaultSize={colSizes[cellIndex]}
                                            onResize={(size) => handleResizeCol(cellIndex, size)}
                                            className='w-full h-full'
                                        >
                                            <div className='relative w-full h-full'>
                                                <input type="text" value={cell}
                                                    onChange={(e) => updateCell(rowIndex, cellIndex, e.target.value)}
                                                    className='w-full h-full p-3 bg-transparent focus:outline-hidden focus:bg-primary/5 transition-colors text-sm md:text-base'
                                                    style={{
                                                        color: currentTheme.fontColor
                                                    }}
                                                    placeholder='Type here'
                                                    readOnly={!isEditable}
                                                />
                                            </div>
                                        </ResizablePanel>
                                    </React.Fragment>
                                ))}
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </React.Fragment>
                ))}
            </ResizablePanelGroup>
        </div>
    )


}

export default TableComponent
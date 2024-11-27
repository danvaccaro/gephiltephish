'use client';

interface FilterControlsProps {
    showMineOnly: boolean;
    showUnvotedOnly: boolean;
    onShowMineOnlyChange: (value: boolean) => void;
    onShowUnvotedOnlyChange: (value: boolean) => void;
}

export default function FilterControls({
    showMineOnly,
    showUnvotedOnly,
    onShowMineOnlyChange,
    onShowUnvotedOnlyChange
}: FilterControlsProps) {
    return (
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="showMineOnly"
                    checked={showMineOnly}
                    onChange={(e) => onShowMineOnlyChange(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="showMineOnly" className="text-sm text-gray-900 dark:text-white">
                    Show only my submissions
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="showUnvotedOnly"
                    checked={showUnvotedOnly}
                    onChange={(e) => onShowUnvotedOnlyChange(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="showUnvotedOnly" className="text-sm text-gray-900 dark:text-white">
                    Show only unvoted emails
                </label>
            </div>
        </div>
    );
}

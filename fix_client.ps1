$files = @(
    "components\attendance\AdminAttendance.tsx",
    "components\dashboard\AttendanceButtons.tsx",
    "components\employees\EmployeeDialog.tsx",
    "components\employees\EmployeeTable.tsx",
    "components\holidays\HolidayDialog.tsx",
    "components\leaves\ApplyLeaveDialog.tsx",
    "components\profile\ProfileForm.tsx",
    "components\reports\ReportViewer.tsx",
    "components\settings\SettingsForm.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Check if the file starts with the import but has "use client" further down
        if ($content -match '(?s)^import \{ toast \} from "sonner";\s*("use client";|''use client'';)') {
            # It's in the wrong order
            $content = $content -replace '(?s)^import \{ toast \} from "sonner";\s*("use client";|''use client'';)', "`$1`nimport { toast } from `"sonner`";"
            Set-Content $file $content
        }
    }
}

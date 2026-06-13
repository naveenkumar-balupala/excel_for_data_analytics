// Sample MCQ question bank based on the "Excel for Data Analytics" Skill Sprint
// syllabus. Admin can seed these into Firestore with one click from the
// "Manage Questions" page, then add/edit/delete more as needed.
//
// q(testType, dayNumber, topic, difficulty, text, options[4], correctIndex)
const q = (testType, dayNumber, topic, difficulty, text, options, correctIndex) => ({
  testType,
  dayNumber,
  topic,
  unit: testType === 'Day-wise Test' ? `Day ${dayNumber}` : testType,
  difficulty,
  questionText: text,
  options,
  correctAnswer: options[correctIndex],
})

// ---------------------------------------------------------------------------
// PRE-ASSESSMENT (general Excel readiness) — 30 questions
// ---------------------------------------------------------------------------
const preAssessment = [
  q('Pre-Assessment', null, 'Interface & Navigation', 'Easy', 'Which key combination moves the cursor to cell A1?', ['Ctrl + Home', 'Ctrl + End', 'Alt + Home', 'Shift + A1'], 0),
  q('Pre-Assessment', null, 'Interface & Navigation', 'Easy', 'What is the intersection of a row and a column called?', ['A cell', 'A range', 'A sheet', 'A field'], 0),
  q('Pre-Assessment', null, 'Data Types', 'Easy', 'By default, text entered in a cell aligns to the:', ['Left', 'Right', 'Center', 'Top'], 0),
  q('Pre-Assessment', null, 'Data Types', 'Easy', 'By default, numbers entered in a cell align to the:', ['Right', 'Left', 'Center', 'Bottom'], 0),
  q('Pre-Assessment', null, 'Cell Referencing', 'Medium', 'Which is an absolute cell reference?', ['$A$1', 'A1', 'A$1', '$A1'], 0),
  q('Pre-Assessment', null, 'Cell Referencing', 'Medium', 'In a mixed reference A$1, what stays fixed when copied down?', ['The row', 'The column', 'Both', 'Neither'], 0),
  q('Pre-Assessment', null, 'Keyboard Shortcuts', 'Easy', 'Which shortcut copies the selected cells?', ['Ctrl + C', 'Ctrl + V', 'Ctrl + X', 'Ctrl + Z'], 0),
  q('Pre-Assessment', null, 'Keyboard Shortcuts', 'Easy', 'Ctrl + Z performs which action?', ['Undo', 'Redo', 'Save', 'Print'], 0),
  q('Pre-Assessment', null, 'Aggregation', 'Easy', 'Which function adds a range of numbers?', ['SUM', 'COUNT', 'AVERAGE', 'MAX'], 0),
  q('Pre-Assessment', null, 'Aggregation', 'Easy', 'Which function returns the largest value in a range?', ['MAX', 'MIN', 'LARGE', 'BIG'], 0),
  q('Pre-Assessment', null, 'Aggregation', 'Medium', 'COUNTA counts cells that are:', ['Not empty', 'Only numbers', 'Only text', 'Only blank'], 0),
  q('Pre-Assessment', null, 'Formulas', 'Easy', 'Every Excel formula must begin with which symbol?', ['=', '+', '@', '#'], 0),
  q('Pre-Assessment', null, 'Formulas', 'Medium', 'What does the formula =A1+A2*2 evaluate first?', ['A2*2', 'A1+A2', 'Left to right', 'A1*2'], 0),
  q('Pre-Assessment', null, 'Text Functions', 'Easy', 'Which function removes extra spaces from text?', ['TRIM', 'CLEAN', 'PROPER', 'CUT'], 0),
  q('Pre-Assessment', null, 'Text Functions', 'Medium', 'PROPER("hello world") returns:', ['Hello World', 'HELLO WORLD', 'hello world', 'Hello world'], 0),
  q('Pre-Assessment', null, 'Lookup', 'Medium', 'VLOOKUP searches for a value in the:', ['First column of a range', 'Last column', 'First row', 'Any column'], 0),
  q('Pre-Assessment', null, 'Lookup', 'Medium', 'For an exact match in VLOOKUP, the last argument should be:', ['FALSE', 'TRUE', '1', 'Blank'], 0),
  q('Pre-Assessment', null, 'Logical', 'Medium', 'Which function returns one value if a condition is true and another if false?', ['IF', 'AND', 'OR', 'NOT'], 0),
  q('Pre-Assessment', null, 'Logical', 'Medium', 'AND(TRUE, FALSE) returns:', ['FALSE', 'TRUE', 'Error', '0'], 0),
  q('Pre-Assessment', null, 'Sorting & Filtering', 'Easy', 'Sorting data A→Z arranges text in which order?', ['Ascending', 'Descending', 'Random', 'Reverse'], 0),
  q('Pre-Assessment', null, 'Sorting & Filtering', 'Medium', 'A filter is used to:', ['Show only rows that meet criteria', 'Delete rows', 'Sort columns', 'Lock cells'], 0),
  q('Pre-Assessment', null, 'Excel Tables', 'Medium', 'Which shortcut converts a range into an Excel Table?', ['Ctrl + T', 'Ctrl + L', 'Ctrl + E', 'Ctrl + Tab'], 0),
  q('Pre-Assessment', null, 'Charts', 'Easy', 'Which chart is best for showing parts of a whole?', ['Pie chart', 'Line chart', 'Scatter plot', 'Histogram'], 0),
  q('Pre-Assessment', null, 'Charts', 'Easy', 'A line chart is best used to show:', ['Trends over time', 'Proportions', 'Correlation only', 'Single values'], 0),
  q('Pre-Assessment', null, 'PivotTables', 'Medium', 'A PivotTable is mainly used to:', ['Summarize large data', 'Format text', 'Print sheets', 'Lock cells'], 0),
  q('Pre-Assessment', null, 'Number Formatting', 'Easy', 'Which format displays a value as a percentage?', ['0%', '0.00', '#,##0', '@'], 0),
  q('Pre-Assessment', null, 'Data Cleaning', 'Medium', 'Remove Duplicates is found under which ribbon tab?', ['Data', 'Home', 'Insert', 'View'], 0),
  q('Pre-Assessment', null, 'Date Functions', 'Medium', 'Which function returns the current date?', ['TODAY()', 'NOW()', 'DATE()', 'DAY()'], 0),
  q('Pre-Assessment', null, 'Error Handling', 'Medium', 'Which function catches and replaces formula errors?', ['IFERROR', 'ISERROR', 'ERROR', 'TRYCATCH'], 0),
  q('Pre-Assessment', null, 'Freeze Panes', 'Easy', 'Freeze Panes is used to:', ['Keep rows/columns visible while scrolling', 'Lock the file', 'Hide rows', 'Protect cells'], 0),
]

// ---------------------------------------------------------------------------
// DAY-WISE TESTS (Day 1–6). Sample set per day — admin adds the rest to reach 30.
// ---------------------------------------------------------------------------
const day1 = [
  q('Day-wise Test', 1, 'Interface & Navigation', 'Easy', 'The Name Box in Excel shows the:', ['Address of the active cell', 'Formula result', 'Sheet name', 'File name'], 0),
  q('Day-wise Test', 1, 'Cell Referencing', 'Medium', 'Pressing F4 while editing a reference does what?', ['Cycles reference types', 'Deletes the reference', 'Adds a comment', 'Opens help'], 0),
  q('Day-wise Test', 1, 'Custom Number Formatting', 'Medium', 'The format code #,##0.00 displays 1234.5 as:', ['1,234.50', '1234.5', '1234.50', '1,234.5'], 0),
  q('Day-wise Test', 1, 'Excel Tables', 'Medium', 'Excel Tables created with Ctrl+T support:', ['Structured references', 'Macros only', 'No formatting', 'Manual sorting only'], 0),
  q('Day-wise Test', 1, 'Structured References', 'Hard', 'In a Table named Sales, [@Amount] refers to:', ['Amount in the current row', 'The whole Amount column', 'A header cell', 'A total row'], 0),
  q('Day-wise Test', 1, 'Sorting & Filtering', 'Easy', 'Multi-level sorting lets you sort by:', ['More than one column', 'Only one column', 'Rows only', 'Colors only'], 0),
  q('Day-wise Test', 1, 'Freeze Panes & Views', 'Easy', 'Freeze Top Row keeps which row visible?', ['Row 1', 'The active row', 'The last row', 'No row'], 0),
  q('Day-wise Test', 1, 'Keyboard Shortcuts', 'Easy', 'Ctrl + Arrow key jumps to:', ['Edge of the data region', 'Cell A1', 'Next sheet', 'The ribbon'], 0),
]
const day2 = [
  q('Day-wise Test', 2, 'Remove Duplicates', 'Easy', 'After Remove Duplicates, Excel keeps:', ['The first occurrence', 'The last occurrence', 'No rows', 'All rows'], 0),
  q('Day-wise Test', 2, 'Text-to-Columns', 'Medium', 'Text-to-Columns splits data based on a:', ['Delimiter or fixed width', 'Formula', 'Color', 'Filter'], 0),
  q('Day-wise Test', 2, 'Flash Fill', 'Medium', 'Which shortcut triggers Flash Fill?', ['Ctrl + E', 'Ctrl + F', 'Ctrl + T', 'Ctrl + D'], 0),
  q('Day-wise Test', 2, 'Text Functions', 'Easy', 'UPPER("data") returns:', ['DATA', 'data', 'Data', 'dATA'], 0),
  q('Day-wise Test', 2, 'Text Functions', 'Medium', 'CLEAN() is mainly used to remove:', ['Non-printable characters', 'Spaces', 'Numbers', 'Formulas'], 0),
  q('Day-wise Test', 2, 'Data Validation', 'Medium', 'A drop-down list in a cell is created using:', ['Data Validation', 'Conditional Formatting', 'Format Cells', 'Filter'], 0),
  q('Day-wise Test', 2, 'Combining Columns', 'Medium', 'TEXTJOIN differs from CONCAT because it:', ['Adds a delimiter between values', 'Cannot join text', 'Only joins numbers', 'Splits text'], 0),
  q('Day-wise Test', 2, 'Conditional Formatting', 'Easy', 'Conditional Formatting changes a cell based on:', ['Its value/rule', 'Its address', 'The sheet name', 'The file size'], 0),
]
const day3 = [
  q('Day-wise Test', 3, 'Aggregation', 'Easy', 'AVERAGE ignores which type of cell?', ['Empty cells', 'Number cells', 'The active cell', 'Header cells only'], 0),
  q('Day-wise Test', 3, 'Conditional Aggregation', 'Medium', 'SUMIFS allows you to sum based on:', ['Multiple criteria', 'One criterion only', 'No criteria', 'Text length'], 0),
  q('Day-wise Test', 3, 'Conditional Aggregation', 'Medium', 'COUNTIFS counts cells meeting:', ['All given conditions', 'Any one condition', 'Numbers only', 'Blanks only'], 0),
  q('Day-wise Test', 3, 'Logical', 'Medium', 'A nested IF means:', ['An IF inside another IF', 'Two SUMs', 'An IF with AND only', 'A locked formula'], 0),
  q('Day-wise Test', 3, 'Logical', 'Hard', 'IFS is preferred over nested IF because it:', ['Is easier to read for many conditions', 'Runs faster always', 'Allows text only', 'Needs no conditions'], 0),
  q('Day-wise Test', 3, 'Error Handling', 'Medium', 'IFERROR(A1/B1, 0) returns 0 when:', ['B1 is zero/blank causing an error', 'A1 is negative', 'A1 is text', 'Never'], 0),
  q('Day-wise Test', 3, 'Date Functions', 'Medium', 'DATEDIF is used to calculate:', ['Difference between two dates', "Today's date", 'A weekday name', 'A month name'], 0),
  q('Day-wise Test', 3, 'Date Functions', 'Medium', 'EOMONTH returns the:', ['Last day of a month', 'First day of a month', 'Current time', 'Weekday number'], 0),
]
const day4 = [
  q('Day-wise Test', 4, 'VLOOKUP / HLOOKUP', 'Medium', 'HLOOKUP searches across a:', ['Row', 'Column', 'Sheet', 'Cell'], 0),
  q('Day-wise Test', 4, 'Exact vs Approximate', 'Medium', 'Approximate match in VLOOKUP requires data to be:', ['Sorted ascending', 'Unsorted', 'Text only', 'In one cell'], 0),
  q('Day-wise Test', 4, 'INDEX-MATCH', 'Hard', 'INDEX-MATCH is preferred over VLOOKUP because it can:', ['Look up to the left', 'Only look right', 'Not use ranges', 'Sort data'], 0),
  q('Day-wise Test', 4, 'XLOOKUP', 'Medium', 'XLOOKUP can return a default value using its:', ['if_not_found argument', 'col_index', 'range_lookup', 'TRUE flag'], 0),
  q('Day-wise Test', 4, 'Two-way Lookups', 'Hard', 'A two-way lookup typically combines:', ['INDEX with two MATCH functions', 'Two SUMs', 'IF with OR', 'TRIM with CLEAN'], 0),
  q('Day-wise Test', 4, 'DAX', 'Hard', 'In Power Pivot, CALCULATE is used to:', ['Modify the filter context of a measure', 'Format numbers', 'Sort tables', 'Create charts'], 0),
  q('Day-wise Test', 4, 'DAX', 'Medium', 'SWITCH in DAX is most similar to:', ['Nested IF / IFS', 'VLOOKUP', 'SUMIFS', 'TRIM'], 0),
  q('Day-wise Test', 4, 'Measures', 'Hard', 'An explicit measure in Power Pivot is one that is:', ['Defined with a DAX formula', 'Auto-created by dragging', 'A plain column', 'A chart title'], 0),
]
const day5 = [
  q('Day-wise Test', 5, 'PivotTables', 'Easy', 'Dragging a field to the Values area by default applies:', ['SUM (for numbers)', 'COUNT always', 'AVERAGE always', 'No calculation'], 0),
  q('Day-wise Test', 5, 'Grouping', 'Medium', 'PivotTable grouping can combine dates into:', ['Months/Quarters/Years', 'Random buckets', 'Text only', 'Colors'], 0),
  q('Day-wise Test', 5, 'Calculated Fields', 'Hard', 'A calculated field in a PivotTable is based on:', ['Existing fields via a formula', 'A new sheet', 'External files', 'Cell colors'], 0),
  q('Day-wise Test', 5, 'Value Summaries', 'Medium', '"% of Grand Total" is an example of a:', ['Show Values As option', 'Number format', 'Filter', 'Slicer'], 0),
  q('Day-wise Test', 5, 'Slicers & Timelines', 'Easy', 'A slicer is used to:', ['Visually filter a PivotTable', 'Sort columns', 'Add formulas', 'Print a sheet'], 0),
  q('Day-wise Test', 5, 'Charts', 'Medium', 'A combo chart is useful when you have:', ['Two different value scales', 'Only one series', 'Text data', 'No numbers'], 0),
  q('Day-wise Test', 5, 'Sparklines', 'Easy', 'Sparklines are tiny charts placed:', ['Inside a single cell', 'On a new sheet', 'In the ribbon', 'In a comment'], 0),
  q('Day-wise Test', 5, 'Dashboards', 'Medium', 'An interactive KPI dashboard commonly uses slicers to:', ['Filter multiple charts at once', 'Delete data', 'Lock the workbook', 'Hide formulas'], 0),
]
const day6 = [
  q('Day-wise Test', 6, 'What-If Analysis', 'Medium', 'Goal Seek finds the input needed to reach a:', ['Target formula result', 'New chart', 'Random value', 'Sorted list'], 0),
  q('Day-wise Test', 6, 'What-If Analysis', 'Medium', 'Scenario Manager is used to compare:', ['Different sets of input values', 'Two files', 'Fonts', 'Sheet colors'], 0),
  q('Day-wise Test', 6, 'Data Tables', 'Hard', 'A two-variable Data Table shows results for:', ['Two changing inputs', 'One input only', 'No inputs', 'Text inputs'], 0),
  q('Day-wise Test', 6, 'Power Query', 'Medium', 'Power Query is primarily used to:', ['Extract, transform and load data', 'Create charts', 'Print reports', 'Lock cells'], 0),
  q('Day-wise Test', 6, 'Power Pivot', 'Hard', 'The Data Model in Power Pivot lets you:', ['Relate multiple tables', 'Only hold one table', 'Format text', 'Record macros'], 0),
  q('Day-wise Test', 6, 'Macros', 'Medium', 'The Macro Recorder captures your actions as:', ['VBA code', 'A chart', 'A PivotTable', 'A formula'], 0),
  q('Day-wise Test', 6, 'Capstone', 'Easy', 'A typical analytics workflow ends with:', ['Presenting an interactive dashboard', 'Deleting the data', 'Printing raw data', 'Renaming the file'], 0),
  q('Day-wise Test', 6, 'Capstone', 'Medium', 'Before analyzing a raw dataset you should first:', ['Clean and prepare it', 'Build charts', 'Add macros', 'Protect the sheet'], 0),
]

// ---------------------------------------------------------------------------
// GRAND TEST (mixed, full-syllabus) — 30 questions
// ---------------------------------------------------------------------------
const grand = [
  q('Grand Test', null, 'Cell Referencing', 'Medium', 'Copying =$B2*C$1 one cell right and down becomes:', ['=$B3*D$1', '=$C3*D$2', '=B3*C1', '=$B2*C$1'], 0),
  q('Grand Test', null, 'Excel Tables', 'Medium', 'A benefit of Excel Tables is that formulas:', ['Auto-fill to new rows', 'Cannot be copied', 'Break on sort', 'Hide automatically'], 0),
  q('Grand Test', null, 'Data Cleaning', 'Medium', 'TRIM is best used to fix:', ['Leading/trailing spaces', 'Wrong formulas', 'Missing charts', 'Date errors'], 0),
  q('Grand Test', null, 'Text Functions', 'Medium', 'TEXTSPLIT is used to:', ['Split text into multiple cells', 'Join text', 'Round numbers', 'Sort text'], 0),
  q('Grand Test', null, 'Aggregation', 'Easy', 'COUNT counts cells containing:', ['Numbers', 'Text', 'Blanks', 'Errors'], 0),
  q('Grand Test', null, 'Conditional Aggregation', 'Medium', 'AVERAGEIFS averages values that meet:', ['Multiple criteria', 'One criterion', 'No criteria', 'Text length'], 0),
  q('Grand Test', null, 'Logical', 'Medium', 'OR(FALSE, FALSE, TRUE) returns:', ['TRUE', 'FALSE', 'Error', '0'], 0),
  q('Grand Test', null, 'Error Handling', 'Medium', 'A #DIV/0! error means:', ['Division by zero', 'Wrong text', 'Missing file', 'Locked cell'], 0),
  q('Grand Test', null, 'Date Functions', 'Medium', 'WEEKDAY returns a number representing the:', ['Day of the week', 'Month', 'Year', 'Hour'], 0),
  q('Grand Test', null, 'VLOOKUP / HLOOKUP', 'Medium', 'VLOOKUP returns #N/A when:', ['The value is not found', 'The cell is empty by design', 'Data is sorted', 'The column is hidden'], 0),
  q('Grand Test', null, 'INDEX-MATCH', 'Hard', 'MATCH returns the:', ['Position of a value in a range', 'Value itself', 'A sum', 'A date'], 0),
  q('Grand Test', null, 'XLOOKUP', 'Medium', 'XLOOKUP replaces both VLOOKUP and:', ['HLOOKUP', 'SUMIF', 'TRIM', 'IFERROR'], 0),
  q('Grand Test', null, 'PivotTables', 'Medium', 'To refresh a PivotTable after data changes you:', ['Click Refresh', 'Delete it', 'Re-type data', 'Rename the sheet'], 0),
  q('Grand Test', null, 'PivotTables', 'Medium', 'Grouping numeric data in a PivotTable creates:', ['Ranges/buckets', 'New sheets', 'Macros', 'Charts'], 0),
  q('Grand Test', null, 'Charts', 'Easy', 'A scatter plot is best for showing:', ['Correlation between two variables', 'Parts of a whole', 'A single total', 'Text data'], 0),
  q('Grand Test', null, 'Charts', 'Medium', 'A secondary axis is useful in a:', ['Combo chart', 'Pie chart', 'Single-series bar', 'Sparkline'], 0),
  q('Grand Test', null, 'Slicers', 'Easy', 'A timeline slicer filters data by:', ['Dates', 'Colors', 'Text length', 'Formulas'], 0),
  q('Grand Test', null, 'What-If Analysis', 'Medium', 'Goal Seek changes which to hit a target?', ['One input cell', 'The formula', 'The chart', 'The sheet name'], 0),
  q('Grand Test', null, 'Power Query', 'Medium', 'Merging two queries in Power Query is similar to a:', ['Join/lookup', 'Sort', 'Filter only', 'Macro'], 0),
  q('Grand Test', null, 'DAX', 'Hard', 'An implicit measure is created when you:', ['Drag a field into Values', 'Write a DAX formula', 'Add a slicer', 'Sort a table'], 0),
  q('Grand Test', null, 'Number Formatting', 'Easy', 'The Accounting format aligns:', ['Currency symbols and decimals', 'Text left', 'Dates only', 'Nothing'], 0),
  q('Grand Test', null, 'Sorting & Filtering', 'Medium', 'A custom sort lets you sort by a:', ['Custom list order', 'File size', 'Cell address', 'Formula length'], 0),
  q('Grand Test', null, 'Data Validation', 'Medium', 'Data Validation can restrict entries to:', ['A list or range of values', 'Any value always', 'Only formulas', 'Only charts'], 0),
  q('Grand Test', null, 'Conditional Formatting', 'Medium', 'Color scales in Conditional Formatting show:', ['Relative value magnitude', 'Cell addresses', 'Formulas', 'Sheet names'], 0),
  q('Grand Test', null, 'Macros', 'Medium', 'A recorded macro is stored as:', ['VBA code', 'A PivotTable', 'A chart', 'A formula'], 0),
  q('Grand Test', null, 'Aggregation', 'Easy', 'MIN returns the:', ['Smallest value', 'Largest value', 'Average', 'Count'], 0),
  q('Grand Test', null, 'Lookup', 'Medium', 'The 4th argument of VLOOKUP (FALSE) means:', ['Exact match', 'Approximate match', 'Sorted data', 'Whole column'], 0),
  q('Grand Test', null, 'Freeze Panes', 'Easy', 'Freeze Panes helps mainly with:', ['Large datasets', 'Small datasets', 'Charts', 'Printing'], 0),
  q('Grand Test', null, 'Structured References', 'Hard', 'Table[#Headers] refers to the:', ['Header row of the table', 'Total row', 'First data row', 'Whole sheet'], 0),
  q('Grand Test', null, 'Capstone', 'Medium', 'The best way to present analysis to stakeholders is a:', ['Clear interactive dashboard', 'Raw data dump', 'A single number', 'A macro file'], 0),
]

export const sampleQuestions = [
  ...preAssessment,
  ...day1, ...day2, ...day3, ...day4, ...day5, ...day6,
  ...grand,
]

// Default tests that pair with the sample questions.
export const sampleTests = [
  { testTitle: 'Pre-Assessment Test', testType: 'Pre-Assessment', duration: 30, totalQuestions: 30, dayNumber: null, isActive: true },
  { testTitle: 'Day 1 — Excel Foundations', testType: 'Day-wise Test', duration: 20, totalQuestions: 30, dayNumber: 1, isActive: true },
  { testTitle: 'Day 2 — Data Cleaning & Prep', testType: 'Day-wise Test', duration: 20, totalQuestions: 30, dayNumber: 2, isActive: true },
  { testTitle: 'Day 3 — Core Functions & Formulas', testType: 'Day-wise Test', duration: 20, totalQuestions: 30, dayNumber: 3, isActive: true },
  { testTitle: 'Day 4 — Lookup & Dynamic Analysis', testType: 'Day-wise Test', duration: 20, totalQuestions: 30, dayNumber: 4, isActive: true },
  { testTitle: 'Day 5 — PivotTables & Dashboards', testType: 'Day-wise Test', duration: 20, totalQuestions: 30, dayNumber: 5, isActive: true },
  { testTitle: 'Day 6 — Tools, Automation & Capstone', testType: 'Day-wise Test', duration: 20, totalQuestions: 30, dayNumber: 6, isActive: true },
  { testTitle: 'Grand Test — Full Syllabus', testType: 'Grand Test', duration: 45, totalQuestions: 30, dayNumber: null, isActive: true },
]

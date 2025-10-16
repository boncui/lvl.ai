# Chart Components

This directory contains reusable chart components extracted from the hotel-dashboard v0 template. All components are built using Recharts and are fully customizable.

## Components

### 1. RevenueBarChart
A bar chart component for displaying revenue data.

```tsx
import { RevenueBarChart } from "@/components/charts"

const data = [
  { name: "Sun", value: 8 },
  { name: "Mon", value: 10 },
  // ... more data
]

<RevenueBarChart 
  data={data}
  height={200}
  color="#F59E0B"
  showTooltip={true}
  showGrid={true}
/>
```

### 2. GuestsLineChart
A line chart component for displaying guest data with gradient fill.

```tsx
import { GuestsLineChart } from "@/components/charts"

const data = [
  { name: "Sun", value: 8000 },
  { name: "Mon", value: 10000 },
  // ... more data
]

<GuestsLineChart 
  data={data}
  height={200}
  color="#3B82F6"
  showTooltip={true}
  showGrid={true}
/>
```

### 3. RoomsStackedBarChart
A stacked bar chart for displaying room occupancy data.

```tsx
import { RoomsStackedBarChart } from "@/components/charts"

const data = [
  { name: "Sun", occupied: 15, booked: 10, available: 25 },
  { name: "Mon", occupied: 20, booked: 12, available: 18 },
  // ... more data
]

<RoomsStackedBarChart 
  data={data}
  height={180}
  colors={{
    occupied: "#3B82F6",
    booked: "#10B981",
    available: "#F59E0B"
  }}
  showTooltip={true}
  showGrid={true}
/>
```

### 4. FoodOrdersPieChart
A pie chart component for displaying order distribution.

```tsx
import { FoodOrdersPieChart } from "@/components/charts"

const data = [
  { name: "Breakfast", value: 35 },
  { name: "Lunch", value: 45 },
  // ... more data
]

<FoodOrdersPieChart 
  data={data}
  height={250}
  colors={["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]}
  showTooltip={true}
  showLabels={true}
/>
```

### 5. ChartCard
A wrapper component that provides consistent styling and optional dropdown functionality.

```tsx
import { ChartCard } from "@/components/charts"

<ChartCard 
  title="Revenue"
  showDropdown={true}
  dropdownItems={["This Month", "This Year"]}
  onDropdownSelect={(item) => console.log("Selected:", item)}
>
  <RevenueBarChart data={revenueData} />
</ChartCard>
```

## Sample Data Generators

The components include utility functions to generate sample data for testing:

```tsx
import { 
  generateRevenueData,
  generateGuestsData,
  generateRoomsData,
  generateFoodOrdersData
} from "@/components/charts"

// Use in your components
const revenueData = generateRevenueData()
const guestsData = generateGuestsData()
const roomsData = generateRoomsData()
const foodOrdersData = generateFoodOrdersData()
```

## Dependencies

- **Recharts**: Chart library
- **Lucide React**: Icons
- **Radix UI**: UI primitives for dropdowns
- **Tailwind CSS**: Styling

## Usage Example

```tsx
import { 
  ChartCard, 
  RevenueBarChart, 
  generateRevenueData 
} from "@/components/charts"

export function MyDashboard() {
  const revenueData = generateRevenueData()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="Revenue">
        <RevenueBarChart data={revenueData} />
      </ChartCard>
    </div>
  )
}
```

## Customization

All chart components accept props for customization:
- **height**: Chart height in pixels
- **color/colors**: Chart colors
- **showTooltip**: Enable/disable tooltips
- **showGrid**: Enable/disable grid lines
- **showLabels**: Enable/disable labels (pie chart)

The components are fully responsive and will adapt to their container size.

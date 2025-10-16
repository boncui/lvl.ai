"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ChevronDown } from "lucide-react"
import { RevenueBarChart } from "./RevenueBarChart"
import { GuestsLineChart } from "./GuestsLineChart"
import { RoomsStackedBarChart } from "./RoomsStackedBarChart"
import { FoodOrdersPieChart } from "./FoodOrdersPieChart"

interface ChartCardProps {
  title: string
  children: React.ReactNode
  showDropdown?: boolean
  dropdownItems?: string[]
  onDropdownSelect?: (item: string) => void
}

export function ChartCard({ 
  title, 
  children, 
  showDropdown = false, 
  dropdownItems = [],
  onDropdownSelect 
}: ChartCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {showDropdown && (
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            this week <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {children}
      </CardContent>
    </Card>
  )
}

// Sample data generators for testing
export const generateRevenueData = () => [
  { name: "Sun", value: 8 },
  { name: "Mon", value: 10 },
  { name: "Tue", value: 12 },
  { name: "Wed", value: 11 },
  { name: "Thu", value: 9 },
  { name: "Fri", value: 11 },
  { name: "Sat", value: 12 },
]

export const generateGuestsData = () => [
  { name: "Sun", value: 8000 },
  { name: "Mon", value: 10000 },
  { name: "Tue", value: 12000 },
  { name: "Wed", value: 9000 },
  { name: "Thu", value: 6000 },
  { name: "Fri", value: 8000 },
]

export const generateRoomsData = () => [
  { name: "Sun", occupied: 15, booked: 10, available: 25 },
  { name: "Mon", occupied: 20, booked: 12, available: 18 },
  { name: "Tue", occupied: 18, booked: 15, available: 17 },
  { name: "Wed", occupied: 22, booked: 10, available: 18 },
  { name: "Thu", occupied: 20, booked: 15, available: 15 },
  { name: "Fri", occupied: 18, booked: 12, available: 20 },
  { name: "Sat", occupied: 15, booked: 10, available: 25 },
]

export const generateFoodOrdersData = () => [
  { name: "Breakfast", value: 35 },
  { name: "Lunch", value: 45 },
  { name: "Dinner", value: 55 },
  { name: "Room Service", value: 25 },
]

// Export all chart components
export {
  RevenueBarChart,
  GuestsLineChart,
  RoomsStackedBarChart,
  FoodOrdersPieChart,
}

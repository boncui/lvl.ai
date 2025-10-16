"use client"

import React from "react"
import { ChartCard, generateRevenueData, generateGuestsData, generateRoomsData, generateFoodOrdersData } from "./index"

export function ChartsDemo() {
  const revenueData = generateRevenueData()
  const guestsData = generateGuestsData()
  const roomsData = generateRoomsData()
  const foodOrdersData = generateFoodOrdersData()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Chart Components Demo</h2>
      
      {/* Revenue Chart */}
      <ChartCard 
        title="Revenue" 
        showDropdown={true}
        dropdownItems={["This Month", "This Year"]}
        onDropdownSelect={(item) => console.log("Selected:", item)}
      >
        <div className="h-[200px] w-full">
          {/* RevenueBarChart will be imported and used here */}
        </div>
      </ChartCard>

      {/* Guests Chart */}
      <ChartCard 
        title="Guests" 
        showDropdown={true}
        dropdownItems={["This Month", "This Year"]}
      >
        <div className="h-[200px] w-full">
          {/* GuestsLineChart will be imported and used here */}
        </div>
      </ChartCard>

      {/* Rooms Chart */}
      <ChartCard title="Rooms">
        <div className="text-xs mb-2">
          <div className="flex items-center justify-between">
            <p>Total 50 Rooms</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span>Available</span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-[180px] w-full">
          {/* RoomsStackedBarChart will be imported and used here */}
        </div>
      </ChartCard>

      {/* Food Orders Chart */}
      <ChartCard title="Order Distribution">
        <div className="h-[250px]">
          {/* FoodOrdersPieChart will be imported and used here */}
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {foodOrdersData.map((entry, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-1"
                style={{ 
                  backgroundColor: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][index % 4] 
                }}
              ></div>
              <span className="text-xs">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}

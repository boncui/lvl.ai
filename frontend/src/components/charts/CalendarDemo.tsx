"use client"

import React from "react"
import { Calendar, CalendarEvent, useCalendarEvents } from "./calender"

export function CalendarDemo() {
  const { events, addEvent, updateEvent, deleteEvent } = useCalendarEvents()

  const handleDateSelect = (date: Date) => {
    console.log("Selected date:", date)
  }

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event)
    // You could open a modal or navigate to event details
  }

  const handleAddEvent = (date: Date) => {
    const title = prompt("Event title:")
    if (title) {
      addEvent({
        title,
        date,
        time: "12:00 PM",
        color: "bg-purple-100 text-purple-800",
        description: "New event",
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Calendar Component Demo</h1>
      
      <div className="mb-6">
        <Calendar
          events={events}
          onDateSelect={handleDateSelect}
          onEventClick={handleEventClick}
          onAddEvent={handleAddEvent}
          initialDate={new Date()}
          view="month"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Month, Week, and Day views</li>
            <li>• Date selection and navigation</li>
            <li>• Event management</li>
            <li>• Responsive design</li>
            <li>• Customizable events with colors</li>
            <li>• Today button for quick navigation</li>
            <li>• Event overflow handling</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Usage</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm text-gray-700">
{`<Calendar
  events={events}
  onDateSelect={handleDateSelect}
  onEventClick={handleEventClick}
  onAddEvent={handleAddEvent}
  initialDate={new Date()}
  view="month"
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

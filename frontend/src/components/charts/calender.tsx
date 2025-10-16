"use client"

import React, { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

export type CalendarView = "month" | "week" | "day"

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  time?: string
  color?: string
  description?: string
}

interface CalendarProps {
  events?: CalendarEvent[]
  onDateSelect?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  onAddEvent?: (date: Date) => void
  initialDate?: Date
  view?: CalendarView
  className?: string
}

export function Calendar({
  events = [],
  onDateSelect,
  onEventClick,
  onAddEvent,
  initialDate = new Date(),
  view: initialView = "month",
  className = "",
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [view, setView] = useState<CalendarView>(initialView)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Navigation functions
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    const days = direction === "prev" ? -7 : 7
    newDate.setDate(newDate.getDate() + days)
    setCurrentDate(newDate)
  }

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    const days = direction === "prev" ? -1 : 1
    newDate.setDate(newDate.getDate() + days)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()
    
    const days = []
    
    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      })
    }
    
    // Current month's days
    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: selectedDate?.toDateString() === date.toDateString(),
      })
    }
    
    // Next month's leading days
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      })
    }
    
    return days
  }, [currentDate, selectedDate])

  // Generate week data
  const weekData = useMemo(() => {
    const today = new Date()
    const startOfWeek = new Date(currentDate)
    const dayOfWeek = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)
    
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDays.push({
        date,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        isToday: date.toDateString() === today.toDateString(),
        isSelected: selectedDate?.toDateString() === date.toDateString(),
      })
    }
    
    return weekDays
  }, [currentDate, selectedDate])

  // Generate day data (hourly slots)
  const dayData = useMemo(() => {
    const hours = []
    for (let hour = 0; hour < 24; hour++) {
      hours.push({
        hour,
        time: `${hour.toString().padStart(2, '0')}:00`,
        displayTime: hour === 0 ? '12:00 AM' : 
                    hour < 12 ? `${hour}:00 AM` :
                    hour === 12 ? '12:00 PM' : 
                    `${hour - 12}:00 PM`
      })
    }
    return hours
  }, [])

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    )
  }

  // Get events for a specific hour
  const getEventsForHour = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = event.date.toDateString() === date.toDateString()
      if (!eventDate) return false
      
      if (event.time) {
        const [eventHour] = event.time.split(':').map(Number)
        return eventHour === hour
      }
      return false
    })
  }

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateSelect?.(date)
  }

  // Handle event click
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventClick?.(event)
  }

  // Handle add event
  const handleAddEvent = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation()
    onAddEvent?.(date)
  }

  // Format date for display
  const formatDate = (date: Date) => {
    if (view === "week") {
      const startOfWeek = new Date(date)
      const dayOfWeek = startOfWeek.getDay()
      startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      const startMonth = startOfWeek.getMonth()
      const endMonth = endOfWeek.getMonth()
      const startYear = startOfWeek.getFullYear()
      const endYear = endOfWeek.getFullYear()
      
      if (startMonth === endMonth && startYear === endYear) {
        return `${startOfWeek.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${endOfWeek.getDate()}, ${startYear}`
      } else if (startYear === endYear) {
        return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${startYear}`
      } else {
        return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      }
    } else if (view === "day") {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  // Get week days
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (view === "month") navigateMonth("prev")
                  else if (view === "week") navigateWeek("prev")
                  else navigateDay("prev")
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (view === "month") navigateMonth("next")
                  else if (view === "week") navigateWeek("next")
                  else navigateDay("next")
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {formatDate(currentDate)}
          </h2>
          <div className="flex items-center gap-1">
            {(["month", "week", "day"] as CalendarView[]).map((viewType) => (
              <Button
                key={viewType}
                variant={view === viewType ? "primary" : "outline"}
                size="sm"
                onClick={() => setView(viewType)}
                className="capitalize"
              >
                {viewType}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {view === "month" && (
          <div className="space-y-4">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((day, index) => {
                const dayEvents = getEventsForDate(day.date)
                return (
                  <div
                    key={index}
                    className={`
                      min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors
                      ${day.isCurrentMonth ? "bg-white" : "bg-gray-50"}
                      ${day.isToday ? "ring-2 ring-blue-500" : ""}
                      ${day.isSelected ? "bg-blue-100" : ""}
                      hover:bg-gray-100
                    `}
                    onClick={() => handleDateClick(day.date)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                          text-sm font-medium
                          ${day.isCurrentMonth ? "text-gray-900" : "text-gray-400"}
                          ${day.isToday ? "text-blue-600 font-bold" : ""}
                        `}
                      >
                        {day.date.getDate()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => handleAddEvent(day.date, e)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Events */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`
                            text-xs p-1 rounded truncate cursor-pointer
                            ${event.color || "bg-blue-100 text-blue-800"}
                          `}
                          onClick={(e) => handleEventClick(event, e)}
                        >
                          {event.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-2 w-2" />
                              {event.time}
                            </span>
                          )}
                          <span className="block truncate">{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {view === "week" && (
          <div className="space-y-4">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className="grid grid-cols-7 gap-1">
              {weekData.map((day, index) => {
                const dayEvents = getEventsForDate(day.date)
                return (
                  <div
                    key={index}
                    className={`
                      min-h-[200px] p-2 border rounded-lg cursor-pointer transition-colors
                      ${day.isCurrentMonth ? "bg-white" : "bg-gray-50"}
                      ${day.isToday ? "ring-2 ring-blue-500" : ""}
                      ${day.isSelected ? "bg-blue-100" : ""}
                      hover:bg-gray-100
                    `}
                    onClick={() => handleDateClick(day.date)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col">
                        <span
                          className={`
                            text-sm font-medium
                            ${day.isCurrentMonth ? "text-gray-900" : "text-gray-400"}
                            ${day.isToday ? "text-blue-600 font-bold" : ""}
                          `}
                        >
                          {day.date.getDate()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {weekDays[day.date.getDay()]}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => handleAddEvent(day.date, e)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Events */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 5).map((event) => (
                        <div
                          key={event.id}
                          className={`
                            text-xs p-1 rounded truncate cursor-pointer
                            ${event.color || "bg-blue-100 text-blue-800"}
                          `}
                          onClick={(e) => handleEventClick(event, e)}
                        >
                          {event.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-2 w-2" />
                              {event.time}
                            </span>
                          )}
                          <span className="block truncate">{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 5 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {view === "day" && (
          <div className="space-y-4">
            {/* Day header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold">
                  {currentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-sm text-gray-600">
                  {getEventsForDate(currentDate).length} events today
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleAddEvent(currentDate, e)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>

            {/* Hourly time slots */}
            <div className="space-y-1">
              {dayData.map((timeSlot) => {
                const hourEvents = getEventsForHour(currentDate, timeSlot.hour)
                return (
                  <div
                    key={timeSlot.hour}
                    className="flex min-h-[60px] border-b border-gray-200"
                  >
                    {/* Time label */}
                    <div className="w-20 p-2 text-sm text-gray-600 border-r border-gray-200 flex items-center">
                      {timeSlot.displayTime}
                    </div>
                    
                    {/* Events area */}
                    <div className="flex-1 p-2 relative">
                      {hourEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`
                            absolute left-2 right-2 p-2 rounded cursor-pointer text-sm
                            ${event.color || "bg-blue-100 text-blue-800"}
                            hover:shadow-md transition-shadow
                          `}
                          onClick={(e) => handleEventClick(event, e)}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span className="font-medium">{event.title}</span>
                          </div>
                          {event.description && (
                            <p className="text-xs mt-1 opacity-80">
                              {event.description}
                            </p>
                          )}
                        </div>
                      ))}
                      
                      {/* Clickable area for adding events */}
                      <div
                        className="w-full h-full cursor-pointer hover:bg-gray-50 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          onAddEvent?.(currentDate)
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Sample events for testing
export const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Meeting",
    date: new Date(),
    time: "10:00",
    color: "bg-blue-100 text-blue-800",
    description: "Weekly team sync",
  },
  {
    id: "2",
    title: "Project Deadline",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    time: "17:00",
    color: "bg-red-100 text-red-800",
    description: "Submit final project",
  },
  {
    id: "3",
    title: "Client Call",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    time: "14:00",
    color: "bg-green-100 text-green-800",
    description: "Discuss requirements",
  },
  {
    id: "4",
    title: "Morning Standup",
    date: new Date(),
    time: "09:00",
    color: "bg-purple-100 text-purple-800",
    description: "Daily standup meeting",
  },
  {
    id: "5",
    title: "Lunch Break",
    date: new Date(),
    time: "12:00",
    color: "bg-yellow-100 text-yellow-800",
    description: "Lunch with team",
  },
  {
    id: "6",
    title: "Code Review",
    date: new Date(),
    time: "15:00",
    color: "bg-indigo-100 text-indigo-800",
    description: "Review pull requests",
  },
]

// Calendar hook for managing events
export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents)

  const addEvent = (event: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
    }
    setEvents(prev => [...prev, newEvent])
  }

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === id ? { ...event, ...updates } : event
      )
    )
  }

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id))
  }

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
  }
}

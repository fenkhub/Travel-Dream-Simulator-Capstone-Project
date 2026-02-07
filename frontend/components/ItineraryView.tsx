'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, Calendar, Check, Plane } from 'lucide-react';

type ActivitySlot = {
    activity?: string;
    description?: string;
    location?: string;
    lat?: number;
    lng?: number;
};

type ItineraryDay = {
    day_number: number;
    morning?: ActivitySlot;
    afternoon?: ActivitySlot;
    evening?: ActivitySlot;
    travel_times_seconds?: number[];
};

type TopPlace = {
    name?: string;
    address?: string;
    rating?: number;
    lat?: number;
    lng?: number;
};

type WeatherDaily = {
    date: string;
    avg_temp_c: number;
};

type ResearchInfo = {
    weather?: { status?: string; daily?: WeatherDaily[] };
    top_places?: TopPlace[];
};

type TripPreferences = {
    interests: string[];
    budget_range?: string;
    travel_style?: string;
    dietary_restrictions?: string[];
};

type TripParameters = {
    destination: string;
    duration_days: number;
    currency: string;
    travelers: number;
    origin?: string;
    budget_total?: number;
    preferences: TripPreferences;
};

type TripPlan = {
    parameters: TripParameters;
    itinerary: ItineraryDay[];
    budget_info?: {
        total_estimated_cost?: number;
        alternative_plan?: boolean;
        breakdown?: {
            accommodation?: number;
            food?: number;
            activities?: number;
            transport?: number;
            flights?: number;
        };
        flight_options?: Array<{
            airline: string;
            price: number;
            duration: string;
            stops: number;
        }>;
        alternative_scenarios?: Array<{
            title: string;
            description: string;
            new_duration_days: number;
            new_budget_range: string;
            estimated_cost: number;
        }>;
    };
    research_info?: ResearchInfo;
};

interface ItineraryViewProps {
    plan: TripPlan;
    onReset: () => void;
    onApplyAlternative?: (alternative: { title: string; description: string; new_duration_days: number; new_budget_range: string; estimated_cost: number; }) => void;
}

export default function ItineraryView({ plan, onReset, onApplyAlternative }: ItineraryViewProps) {
    const { parameters, itinerary, research_info } = plan;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar / Navigation */}
            <aside className="w-full md:w-80 bg-white border-r border-slate-200 h-screen sticky top-0 overflow-y-auto p-6 hidden md:block">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">{parameters.destination}</h1>
                <div className="flex items-center text-slate-500 text-sm mb-6">
                    <Calendar size={16} className="mr-2" />
                    <span>{parameters.duration_days} Days</span>
                </div>

                <nav className="space-y-2">
                    {itinerary.map((day: ItineraryDay, idx: number) => (
                        <a
                            key={idx}
                            href={`#day-${day.day_number}`}
                            className="block p-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition"
                        >
                            Day {day.day_number}
                        </a>
                    ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <h3 className="font-semibold text-slate-800 mb-4">Trip Details</h3>
                    <div className="space-y-4">
                        {parameters.origin && (
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Origin</label>
                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                    <Plane size={16} className="text-slate-400" />
                                    {parameters.origin}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <h3 className="font-semibold text-slate-800 mb-4">Budget Estimate</h3>
                    <div className={`flex items-center font-bold text-xl ${plan.budget_info?.alternative_plan ? 'text-red-500' : 'text-green-600'
                        }`}>
                        <DollarSign size={20} />
                        <span>
                            {plan.budget_info?.total_estimated_cost
                                ? `${parameters.currency} ${plan.budget_info.total_estimated_cost.toLocaleString()}`
                                : (parameters.budget_total ? `${parameters.currency} ${parameters.budget_total}` : 'Calculating...')}
                        </span>
                    </div>

                    {/* Flight Costs Breakdown */}
                    {plan.budget_info?.breakdown?.flights && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-600 flex items-center gap-1"><Plane size={14} /> Flights</span>
                                <span className="font-semibold text-slate-800">
                                    {parameters.currency} {plan.budget_info.breakdown.flights.toLocaleString()}
                                </span>
                            </div>
                            {plan.budget_info.flight_options && plan.budget_info.flight_options.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    <div className="text-xs font-semibold text-slate-600">Recommended Flight:</div>
                                    {plan.budget_info.flight_options.slice(0, 1).map((flight: any, idx: number) => (
                                        <div key={idx} className="bg-white rounded border border-slate-200 p-2 text-xs">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-slate-800">{flight.airline}</span>
                                                <span className="font-bold text-green-600">${flight.price}</span>
                                            </div>
                                            {flight.outbound && (
                                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                                    <span className="px-1 bg-slate-100 rounded text-[10px]">OUT</span>
                                                    <span>{flight.outbound.duration} • {flight.outbound.stops === 0 ? 'Direct' : `${flight.outbound.stops} stop(s)`}</span>
                                                </div>
                                            )}
                                            {flight.return && (
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <span className="px-1 bg-slate-100 rounded text-[10px]">RET</span>
                                                    <span>{flight.return.duration} • {flight.return.stops === 0 ? 'Direct' : `${flight.return.stops} stop(s)`}</span>
                                                </div>
                                            )}
                                            {!flight.outbound && (
                                                <div className="text-slate-500">{flight.duration} • {flight.stops} stops</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}


                    {/* Budget Alert & Alternative Scenarios */}
                    {plan.budget_info?.alternative_scenarios && plan.budget_info.alternative_scenarios.length > 0 && (
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex items-start gap-2 text-amber-800 mb-2">
                                <div className="p-1 bg-amber-100 rounded-full mt-0.5">
                                    <DollarSign size={14} />
                                </div>
                                <h4 className="font-bold text-sm">Budget Exceeded</h4>
                            </div>
                            <p className="text-xs text-amber-700 mb-3">
                                Your requested budget: {parameters.currency} {parameters.budget_total?.toLocaleString() ?? 'N/A'}
                                <br />
                                Realistic cost for this plan: {parameters.currency} {plan.budget_info?.total_estimated_cost?.toLocaleString() ?? 'N/A'}
                            </p>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-700">Consider these alternatives:</p>
                                {plan.budget_info.alternative_scenarios.map((scenario: any, idx: number) => (
                                    <div key={idx} className="bg-white/60 rounded-lg p-3 border border-slate-200">
                                        <div className="flex items-start justify-between mb-1">
                                            <h5 className="font-semibold text-slate-800 text-xs">
                                                {scenario.title}
                                            </h5>
                                            <span className="text-xs font-bold text-green-600">
                                                {parameters.currency} {scenario.estimated_cost.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 mb-2">
                                            {scenario.description}
                                        </p>
                                        {onApplyAlternative && (
                                            <button
                                                onClick={() => onApplyAlternative(scenario)}
                                                className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1"
                                            >
                                                <Check size={12} />
                                                Apply This Option
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {research_info?.weather?.daily && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h3 className="font-semibold text-slate-800 mb-4">Weather (avg °C)</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {research_info.weather.daily.map((d: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                    <span className="text-slate-600">{d.date}</span>
                                    <span className="font-semibold text-slate-900">{d.avg_temp_c}°</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {research_info?.top_places && research_info.top_places.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h3 className="font-semibold text-slate-800 mb-4">Top Places</h3>
                        <div className="space-y-2">
                            {research_info.top_places.slice(0, 8).map((p: any, idx: number) => (
                                <div key={idx} className="bg-white/70 rounded-lg p-3 border border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-800 font-medium">{p.name}</span>
                                        {p.rating && <span className="text-xs text-slate-500">⭐ {p.rating}</span>}
                                    </div>
                                    {p.address && <div className="text-xs text-slate-500 mt-1">{p.address}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={onReset}
                    className="mt-8 w-full py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                >
                    Plan New Trip
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Header for Mobile */}
                    <div className="md:hidden mb-8">
                        <h1 className="text-3xl font-bold text-slate-800">{parameters.destination}</h1>
                        <p className="text-slate-500">{parameters.duration_days} Days • {parameters.preferences.travel_style}</p>
                    </div>

                    {itinerary.map((day: any, idx: number) => (
                        <motion.section
                            key={idx}
                            id={`day-${day.day_number}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative pl-8 border-l-2 border-blue-100 space-y-8"
                        >
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-100"></div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Day {day.day_number}</h2>
                                <p className="text-slate-500 italic">Focus: Exploration & Culture</p>
                            </div>

                            <div className="grid gap-6">
                                {(['morning', 'afternoon', 'evening'] as const).map((period) => (
                                    (day as any)[period] && (
                                        <div key={period} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">
                                                <Clock size={14} />
                                                {period}
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-800 mb-2">{(day as any)[period].activity || "Free Time"}</h3>
                                            <p className="text-slate-600 text-sm leading-relaxed">{(day as any)[period].description || "Enjoy your time exploring."}</p>
                                            {(day as any)[period].location && (
                                                <div className="mt-4 flex items-center text-slate-400 text-sm">
                                                    <MapPin size={14} className="mr-1" />
                                                    {(day as any)[period].location}
                                                </div>
                                            )}
                                            {period === 'evening' && day.travel_times_seconds && day.travel_times_seconds.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {day.travel_times_seconds.map((sec: number, i: number) => (
                                                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                                                            <Clock size={12} /> {Math.round(sec / 60)} min
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                ))}
                            </div>
                        </motion.section>
                    ))}
                </div>
            </main>

            {/* Map Placeholder (Right side on large screens or toggle) */}
            {/* For MVP, keeping it simple as a list view */}
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import LandingInput from '@/components/LandingInput';
import ClarificationView from '@/components/ClarificationView';
import ItineraryView from '@/components/ItineraryView';

// Define API Base URL - assuming backend is on port 8000
const API_BASE_URL = 'http://localhost:8000/api/v1/trip';

export default function PlanPage() {
    const [step, setStep] = useState<'input' | 'clarification' | 'itinerary'>('input');
    const [planData, setPlanData] = useState<any>(null);
    const [userDescription, setUserDescription] = useState('');

    // Mutation to generate the initial plan structure (clarification)
    const generatePlanMutation = useMutation({
        mutationFn: async (data: { description: string; interests: string[] }) => {
            // Call the real interpret endpoint
            const response = await axios.post(`${API_BASE_URL}/interpret`, {
                description: data.description
            });
            return response.data;
        },
        onSuccess: (data) => {
            // Merge the API response with local preferences (interests) if needed, 
            // though the agent should handle it. For now, we trust the agent's output.
            setPlanData({ parameters: data });
            setStep('clarification');
        },
        onError: (error) => {
            console.error("Failed to interpret dream:", error);
            alert("Failed to connect to the Dream Interpreter. Is the backend running?");
        }
    });

    // Mutation to confirm and generate the full itinerary
    const confirmPlanMutation = useMutation({
        mutationFn: async (params: any) => {
            // Call the real generate endpoint with the UPDATED parameters
            const response = await axios.post(`${API_BASE_URL}/generate`, params);
            return response.data;
        },
        onSuccess: (data) => {
            setPlanData(data);
            setStep('itinerary');
        },
        onError: (error) => {
            console.error("Failed to generate itinerary:", error);
            alert("Failed to generate the itinerary. Please try again.");
        }
    });

    const handleInputSubmit = (description: string, interests: string[]) => {
        setUserDescription(description);
        // We append interests to the description for the agent to understand context better
        const fullDescription = interests.length > 0
            ? `${description}. Interests: ${interests.join(', ')}`
            : description;

        generatePlanMutation.mutate({ description: fullDescription, interests });
    };

    const handleClarificationConfirm = (updatedParams: any) => {
        // Update the local plan data with the user's tuned parameters
        setPlanData({ ...planData, parameters: updatedParams });
        // Trigger the generation with the NEW parameters
        confirmPlanMutation.mutate(updatedParams);
    };

    const handleReset = () => {
        setStep('input');
        setPlanData(null);
        setUserDescription('');
    };

    const handleApplyAlternative = (scenario: any) => {
        if (!planData) return;

        // Create updated parameters based on the selected scenario
        const updatedParams = {
            ...planData.parameters,
            duration_days: scenario.new_duration_days,
            budget_total: scenario.estimated_cost,
            preferences: {
                ...planData.parameters.preferences,
                budget_range: scenario.new_budget_range,
            }
        };

        // Update local state and go back to clarification view for user confirmation
        setPlanData({ ...planData, parameters: updatedParams });
        setStep('clarification');
    };

    return (
        <main className="min-h-screen bg-background">
            {step === 'input' && (
                <LandingInput
                    onSubmit={handleInputSubmit}
                    initialValue={userDescription}
                />
            )}

            {step === 'clarification' && planData && (
                <ClarificationView
                    parameters={planData.parameters}
                    onConfirm={handleClarificationConfirm}
                    onEdit={() => setStep('input')}
                />
            )}

            {step === 'itinerary' && planData && (
                <ItineraryView
                    plan={planData}
                    onReset={handleReset}
                    onApplyAlternative={handleApplyAlternative}
                />
            )}

            {/* Loading Overlays */}
            {(generatePlanMutation.isPending || confirmPlanMutation.isPending) && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-lg font-medium text-slate-800">
                            {generatePlanMutation.isPending ? "Interpreting your dream..." : "Crafting your perfect itinerary..."}
                        </p>
                        <p className="text-sm text-slate-500">This may take a moment as our AI agents collaborate.</p>
                    </div>
                </div>
            )}
        </main>
    );
}

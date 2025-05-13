import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { completeOnboarding } from '@/lib/employee';
import { toast } from '@/components/ui/use-toast';

interface TutorialStep {
    id: string;
    title: string;
    description: string;
    component: React.ReactNode;
}

const steps: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to WealthMap',
        description: 'Let\'s get you started with the basics of our platform.',
        component: (
            <div className="space-y-4">
                <p>WealthMap helps you research properties and analyze wealth data efficiently.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Search and filter properties</li>
                    <li>View detailed property information</li>
                    <li>Track property transactions</li>
                    <li>Generate reports and insights</li>
                </ul>
            </div>
        )
    },
    {
        id: 'search',
        title: 'Searching Properties',
        description: 'Learn how to find properties that match your criteria.',
        component: (
            <div className="space-y-4">
                <p>Use our powerful search tools to find properties:</p>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Search Filters</h4>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Location (address, zip code)</li>
                        <li>Property type</li>
                        <li>Price range</li>
                        <li>Size and features</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'reports',
        title: 'Generating Reports',
        description: 'Create and customize reports for your research.',
        component: (
            <div className="space-y-4">
                <p>Generate detailed reports with our reporting tools:</p>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Report Types</h4>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Property analysis</li>
                        <li>Market trends</li>
                        <li>Wealth estimates</li>
                        <li>Custom reports</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'bookmarks',
        title: 'Saving Properties',
        description: 'Learn how to bookmark and organize properties.',
        component: (
            <div className="space-y-4">
                <p>Save and organize properties for future reference:</p>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Bookmark Features</h4>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Save properties to lists</li>
                        <li>Add notes and tags</li>
                        <li>Share with team members</li>
                        <li>Export bookmarks</li>
                    </ul>
                </div>
            </div>
        )
    }
];

export default function OnboardingTutorial() {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const progress = (completedSteps.length / steps.length) * 100;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepComplete = (stepId: string) => {
        if (!completedSteps.includes(stepId)) {
            setCompletedSteps([...completedSteps, stepId]);
        }
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            const { error } = await completeOnboarding('user_id'); // This should come from your auth context
            if (error) throw error;

            toast({
                title: "Success",
                description: "Onboarding completed successfully!",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const currentStepData = steps[currentStep];

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle>Getting Started with WealthMap</CardTitle>
                    <Progress value={progress} className="mt-4" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold">{currentStepData.title}</h3>
                            <p className="text-gray-600 mt-1">{currentStepData.description}</p>
                        </div>

                        <div className="bg-white p-6 rounded-lg border">
                            {currentStepData.component}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={`step-${currentStepData.id}`}
                                checked={completedSteps.includes(currentStepData.id)}
                                onCheckedChange={() => handleStepComplete(currentStepData.id)}
                            />
                            <label
                                htmlFor={`step-${currentStepData.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I understand this step
                            </label>
                        </div>

                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 0}
                            >
                                Back
                            </Button>

                            {currentStep === steps.length - 1 ? (
                                <Button
                                    onClick={handleFinish}
                                    disabled={completedSteps.length !== steps.length || loading}
                                >
                                    {loading ? 'Completing...' : 'Finish Tutorial'}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleNext}
                                    disabled={!completedSteps.includes(currentStepData.id)}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 
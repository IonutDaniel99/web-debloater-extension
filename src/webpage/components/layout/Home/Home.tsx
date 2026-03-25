import { useSettings } from "@/webpage/hooks/useSettings";
import { Button } from "../../ui"

export const Home = () => {

    const {
        lastCheck,
        isChecking,
        handleCheckUpdates,
        isExtension,
        updateInfo,
        handleApplyUpdates,
    } = useSettings();

    return (
        <div className="flex flex-col bg-gray-50">
            <header className="bg-white shadow-sm py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Web Debloater</h1>
                    <p className="text-lg text-gray-600">Clean and optimize your web experience</p>
                </div>
                {/* Update Section */}
                <div className="bg-red-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Updates</p>
                            <p className="text-xs text-muted-foreground">
                                Last checked: {lastCheck ? new Date(lastCheck).toLocaleString() : 'Never'}
                            </p>
                        </div>
                        <Button
                            onClick={handleCheckUpdates}
                            disabled={!isExtension || isChecking}
                            size="sm"
                            variant="outline"
                        >
                            {isChecking ? 'Checking...' : 'Check'}
                        </Button>
                    </div>

                    {updateInfo && updateInfo.needsUpdate && (
                        <div className="mt-3 flex items-center justify-between bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                            <div>
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Update available
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    {updateInfo.localVersion || 'none'} → {updateInfo.remoteVersion}
                                </p>
                            </div>
                            <Button onClick={handleApplyUpdates} size="sm">
                                Apply
                            </Button>
                        </div>
                    )}
                </div>
            </header>


            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
                    <ul className="space-y-3">
                        <li className="flex items-center text-gray-700">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                            Remove unnecessary scripts
                        </li>
                        <li className="flex items-center text-gray-700">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                            Block tracking elements
                        </li>
                        <li className="flex items-center text-gray-700">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                            Optimize page performance
                        </li>
                    </ul>
                </section>

                <section className="text-center">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition">
                        Get Started
                    </button>
                </section>
            </main>
        </div>
    )
}

export default Home;
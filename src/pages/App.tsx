import { useRoutes } from "react-router-dom"
import { Toaster } from "../components/ui/sonner"
import routes from "../routes/index"

const App = () => {
	const routing = useRoutes(routes)
	return (
		<>
			{routing}
			<Toaster />
		</>
	)
}
export default App

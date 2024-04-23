import { Route, Routes } from 'react-router-dom'
import Home from './components/home/Home'
// import CreateNewRequest from './pages/createRequest/CreateNewRequest1'
import CreateNewRequest from './pages/createRequest/CreateNewRequest1'
import Designer from './pages/designer/Designer3'
import Approvers from './pages/approvers/Approvers'
import Navbar from './components/navbar/Navbar1'
import DashboardDesigner from './pages/designer/DashboardDesigner'
import DashboardApprover from './pages/approvers/DashboardApprover'
// import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  

  return (

   <div>
      <Navbar/>
      <Routes>
         <Route path='/' element={<Home/>}/>
         {/* we want to protect these routes */}
         <Route path='/createRequest' element={<CreateNewRequest/>}/>
         <Route path='/designer' element={<Designer/>}/>
         <Route path='/designer/DashboardDesigner' element={<DashboardDesigner/>}/>
         <Route path='/approvers' element={<Approvers/>}/>
         <Route path='/approvers/DashboardApprover' element={<DashboardApprover/>}/>
      </Routes>
   </div>
   
    
    )
}

export default App

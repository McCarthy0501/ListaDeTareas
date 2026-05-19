import { useState,useEffect,useMemo } from "react"
import { API_URL } from "../logic/logic"

export const useTask=()=>{
    const [tareas, setTareas] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading,setLoading]=useState(false);
      const fetchTareas = async () => {
        setLoading(true)
        try {
        const response = await fetch(`${API_URL}/tareas/`)
        const data = await response.json()
        setTareas(data.results)
      
        } catch (error) {
        //console.error(' Error response:', text.substring(0, 200));
        console.error('Error fetching tareas:', error)
        //console.log(data)
             }finally{
                setLoading(false)
             }
         };

    useEffect(() => {fetchTareas()}, [])

  const tareasOrdenadas=useMemo(()=>{
    
    const copiaTareas=[...tareas];

    return copiaTareas.sort((a,b)=>{ 
        const tarea_A=a.titulo;
        const tarea_B=b.titulo;


        if (tarea_A<tarea_B){
            return -1
        }else if(tarea_A>tarea_B){
            return 1
        }
        else{
            return 0
        }})

    



  },[tareas])

const filteredTareas = useMemo(()=>{
        
        return tareasOrdenadas.filter(tarea =>
    tarea.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tarea.descripcion && tarea.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    
  )

    },[tareasOrdenadas,searchTerm])


  

 return{
    
    
    tareas,
    fetchTareas,
    searchTerm,
    setSearchTerm,
    filteredTareas,
    loading
    
}
 

}

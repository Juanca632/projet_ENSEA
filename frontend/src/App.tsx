import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type WeatherData = {
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
};



function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  //  const [isOn, setIsOn] = useState(false);

  const [switches, setSwitches] = useState({
    living_room_lights: false,
    kitchen_lights: false,
    air_conditioning: false,
  });

  useEffect(() => {
    const apiKey = 'ceed50612a02a7adff8f033c86edba0f';
    const city = 'Paris';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setWeather(data);
      })
      .catch((err) => console.error(err));
  }, []);

      const container = {
      display: "flex",
  }
  
  const handle = {
      width: 20,
      height: 20,
      borderRadius: "50%",
  }


    useEffect(() => {
    fetch('http://172.20.10.14:8000/status')
      .then(res => res.json())
      .then(data => {
        setSwitches({
          living_room_lights: data.living_room_lights === 1,
          kitchen_lights: data.kitchen_lights === 1,
          air_conditioning: data.air_conditioning === 1,
        });
      })
      .catch(err => console.error(err));
  }, []);

  // Toggle para cambiar el switch correspondiente
const toggleSwitch = (name: keyof typeof switches) => {
  const newState = !switches[name];

  // Actualiza estado local
  setSwitches(prev => ({
    ...prev,
    [name]: newState,
  }));

  // Define room y device según el nombre del switch
  // Aquí debes mapear bien los nombres a room y device usados en backend
  let room = "";
  let device = "";

  if (name === "living_room_lights") {
    room = "living_room";
    device = "lights";
  } else if (name === "kitchen_lights") {
    room = "kitchen";
    device = "lights";
  } else if (name === "air_conditioning") {
    room = "living_room"; // supongo que está en living_room
    device = "air_conditioning";
  }

  // Enviar POST para actualizar el estado real
  fetch(`http://172.20.10.14:8000/device/${room}/${device}/${newState ? 1 : 0}`, {
    method: "POST",
  })
  .then(res => {
    if (!res.ok) {
      console.error("Error al cambiar estado en backend", res.statusText);
      // Opcional: revertir estado local si fallo el POST
      setSwitches(prev => ({
        ...prev,
        [name]: !newState,
      }));
    }
  })
  .catch(err => {
    console.error("Error en fetch POST:", err);
    // Opcional: revertir estado local si fallo la petición
    setSwitches(prev => ({
      ...prev,
      [name]: !newState,
    }));
  });
};


  return (
    <div className="main-div w-full p-5 flex flex-col gap-5">
      {weather && (
        <div className='w-full bg-blue-950 rounded-3xl p-2 mb-5'>
          <p className='w-full text-center text-white text-2xl'>Paris, France</p>
          <div className='flex justify-center gap-5 h-20'>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <div className='flex items-center'>
              <p className='text-white text-5xl font-bold'>{weather.main.temp.toFixed(1)}°C</p>
            </div>
          </div>
          <p className='text-blue-200 text-2xl text-center'>{weather.weather[0].description}</p>
          <div className='flex gap-2 justify-center mt-2'>
            <p className='text-blue-200 text-md'>Min: {weather.main.temp_min.toFixed(1)}°C</p>
            <p className='text-blue-200 text-md'>Max: {weather.main.temp_max.toFixed(1)}°C</p>
          </div>
        </div>
      )}
      <h1 className='text-center text-4xl'>My Home</h1>
      <div className='w-full bg-blue-100 rounded-xl p-2'>
        <p className='text-center text-2xl pb-5 font-bold'>Living Room</p>
        <ul className='flex flex-col gap-3'>
          <li className='flex justify-between items-center'>
            <p className='text-xl'>Lights</p>
            <button
              className="toggle-container bg-blue-950 rounded-full w-15 h-9 p-2 justify-self-end"
              style={{
                ...container,
                justifyContent: "flex-" + (switches.living_room_lights ? "end" : "start"),
              }}
              onClick={() => toggleSwitch('living_room_lights')}
            >
              <motion.div
                className={`toggle-handle ${switches.living_room_lights ? "bg-blue-300" : "bg-blue-700"}`}
                style={handle}
                layout
                transition={{
                  type: "spring",
                  visualDuration: 0.2,
                  bounce: 0.2,
                }}
              />
            </button>
          </li>
          <li className='flex justify-between items-center'>
            <p className='text-xl'>Air Conditioning</p>
            <button
              className="toggle-container bg-blue-950 rounded-full w-15 h-9 p-2 justify-self-end"
              style={{
                ...container,
                justifyContent: "flex-" + (switches.air_conditioning ? "end" : "start"),
              }}
              onClick={() => toggleSwitch('air_conditioning')}
            >
              <motion.div
                className={`toggle-handle ${switches.air_conditioning ? "bg-blue-300" : "bg-blue-700"}`}
                style={handle}
                layout
                transition={{
                  type: "spring",
                  visualDuration: 0.2,
                  bounce: 0.2,
                }}
              />
            </button>
          </li>
        </ul>
      </div>
      <div className='w-full bg-blue-100 rounded-xl p-2'>
        <p className='text-center text-2xl pb-5 font-bold'>Kitchen</p>
        <ul className='flex flex-col gap-3'>
          <li className='flex justify-between'>
            <p className='text-xl'>Lights</p>
            <button
              className="toggle-container bg-blue-950 rounded-full w-15 h-9 p-2 justify-self-end"
              style={{
                ...container,
                justifyContent: "flex-" + (switches.kitchen_lights ? "end" : "start"),
              }}
              onClick={() => toggleSwitch('kitchen_lights')}
            >
              <motion.div
                className={`toggle-handle ${switches.kitchen_lights ? "bg-blue-300" : "bg-blue-700"}`}
                style={handle}
                layout
                transition={{
                  type: "spring",
                  visualDuration: 0.2,
                  bounce: 0.2,
                }}
              />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;
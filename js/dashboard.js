var GITHUB_USER = "ojairnp";

// 1. GitHub: repos y lenguajes reales
fetch("https://api.github.com/users/" + GITHUB_USER + "/repos?per_page=100")
  .then(function(res){ return res.json(); })
  .then(function(repos){
    if(!Array.isArray(repos)) return;
    document.getElementById("repoCount").textContent = repos.length;

    var langCount = {};
    repos.forEach(function(r){
      if(r.language){
        langCount[r.language] = (langCount[r.language] || 0) + 1;
      }
    });

    var labels = Object.keys(langCount);
    var values = Object.values(langCount);
    var topIndex = values.indexOf(Math.max.apply(null, values));
    document.getElementById("topLang").textContent = labels[topIndex] || "N/A";

    new Chart(document.getElementById("langChart"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{ label: "Repositorios por lenguaje", data: values, backgroundColor: "#58a6ff" }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  })
  .catch(function(err){ console.error("Error GitHub API", err); });

// 2. CoinGecko: precios reales de cripto
function actualizarCripto(){
  fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd")
    .then(function(res){ return res.json(); })
    .then(function(data){
      document.getElementById("btcPrice").textContent = "$" + data.bitcoin.usd.toLocaleString();
      document.getElementById("ethPrice").textContent = "$" + data.ethereum.usd.toLocaleString();
    })
    .catch(function(err){ console.error("Error CoinGecko API", err); });
}
actualizarCripto();
setInterval(actualizarCripto, 30000);

// 3. Simulador de interes compuesto (calculo real)
var interesChartInstance = null;
function calcularInteres(){
  var capital = parseFloat(document.getElementById("capital").value);
  var tasa = parseFloat(document.getElementById("tasa").value) / 100;
  var anios = parseInt(document.getElementById("anios").value);

  var labels = [];
  var valores = [];
  for(var i = 0; i <= anios; i++){
    labels.push("Anio " + i);
    valores.push(Math.round(capital * Math.pow(1 + tasa, i)));
  }

  if(interesChartInstance){ interesChartInstance.destroy(); }
  interesChartInstance = new Chart(document.getElementById("interesChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{ label: "Crecimiento del capital (USD)", data: valores, borderColor: "#a371f7", fill: true, backgroundColor: "rgba(163,113,247,0.15)" }]
    },
    options: { responsive: true }
  });
}
calcularInteres();

// 4. Open-Meteo: clima real de Cancun
fetch("https://api.open-meteo.com/v1/forecast?latitude=21.1619&longitude=-86.8515&current_weather=true")
  .then(function(res){ return res.json(); })
  .then(function(data){
    document.getElementById("temp").textContent = data.current_weather.temperature + " C";
    document.getElementById("viento").textContent = data.current_weather.windspeed + " km/h";
  })
  .catch(function(err){ console.error("Error Open-Meteo API", err); });

// 5. Agente IA (leido del archivo generado por GitHub Actions)
fetch("data/insight_ia.json")
  .then(function(res){ return res.json(); })
  .then(function(data){
    document.getElementById("aiProveedor").textContent = "Generado por: " + data.proveedor;
    document.getElementById("aiInsight").textContent = data.insight;
  })
  .catch(function(err){ console.error("Error leyendo insight_ia.json", err); });


// 6. Pregunta a NEXUS - IA en vivo via Cloudflare Worker
var WORKER_URL = "https://nexus-agente-proxy.ojairnp.workers.dev";

function preguntarIA(){
  var pregunta = document.getElementById("aiPregunta").value.trim();
  var respuestaBox = document.getElementById("aiRespuesta");

  if(!pregunta){
    respuestaBox.textContent = "Escribe una pregunta primero.";
    return;
  }

  respuestaBox.textContent = "Pensando...";

  fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pregunta: pregunta })
  })
    .then(function(res){ return res.json(); })
    .then(function(data){
      respuestaBox.textContent = data.respuesta || data.error || "Sin respuesta.";
    })
    .catch(function(err){
      respuestaBox.textContent = "Error al conectar con el agente IA.";
      console.error(err);
    });
}


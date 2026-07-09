fetch("data/proyectos.json")
  .then(function(res){ return res.json(); })
  .then(function(data){
    document.getElementById("titulo").textContent = data.perfil.titulo;
    document.getElementById("resumen").textContent = data.perfil.resumen;

    var skillsBox = document.getElementById("skills");
    data.habilidades.forEach(function(skill){
      var span = document.createElement("span");
      span.className = "skill-tag";
      span.textContent = skill;
      skillsBox.appendChild(span);
    });

    var proyectosBox = document.getElementById("proyectos");
    data.proyectos.forEach(function(p){
      var card = document.createElement("div");
      card.className = "card";
      card.innerHTML =
        "<h3>" + p.nombre + "</h3>" +
        "<small>" + p.categoria + " - " + p.estado + "</small>" +
        "<p style=\"margin-top:10px;\">" + p.descripcion + "</p>";
      proyectosBox.appendChild(card);
    });
  })
  .catch(function(err){ console.error("Error cargando proyectos.json", err); });

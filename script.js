document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault();

  const motivo = document.getElementById("motivo").value;
  const fechaInicio = new Date(document.getElementById("fechaInicio").value);
  const fechaFin = new Date(document.getElementById("fechaFin").value);
  const salarioBase = parseFloat(document.getElementById("salarioBase").value);
  const salarioNoPrestacional = parseFloat(document.getElementById("salarioNoPrestacional").value);

  // Validación
  if (fechaFin <= fechaInicio) {
    mostrarResultado("La fecha de finalización debe ser posterior a la fecha de inicio.");
    return;
  }

  const diasTrabajados = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
  const diasAño = 360;
  const mesesTrabajados = diasTrabajados / 30;

  const cesantias = (salarioBase * diasTrabajados) / diasAño;
  const interesesCesantias = cesantias * 0.12 * (diasTrabajados / diasAño);
  const prima = (salarioBase * diasTrabajados) / diasAño;
  const vacaciones = (salarioBase * diasTrabajados) / 720;

  let indemnizacion = 0;
  if (motivo === "sin_justa_causa") {
    if (mesesTrabajados < 12) {
      indemnizacion = salarioBase * 0.5 * mesesTrabajados;
    } else {
      indemnizacion = salarioBase + salarioBase * 0.2 * (mesesTrabajados - 12);
    }
  }

  const salarioNoPrestacionalTotal = salarioNoPrestacional; // Solo el mes en curso

  const totalLiquidacion =
    cesantias + interesesCesantias + prima + vacaciones + indemnizacion + salarioNoPrestacionalTotal;

  mostrarResultado(`
    <strong>Días trabajados:</strong> ${diasTrabajados} días<br/>
    <strong>Cesantías:</strong> ${cesantias.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}<br/>
    <strong>Intereses cesantías:</strong> ${interesesCesantias.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}<br/>
    <strong>Prima de servicios:</strong> ${prima.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}<br/>
    <strong>Vacaciones:</strong> ${vacaciones.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}<br/>
    <strong>Indemnización:</strong> ${indemnizacion.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}<br/>
    <strong>Salario no prestacional del último mes:</strong> ${salarioNoPrestacionalTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}<br/>
    <hr>
    <strong>Total liquidación:</strong> ${totalLiquidacion.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
  `);

  // Envío a Google Sheets
  const datosParaEnviar = {
    motivo: motivo,
    fechaInicio: fechaInicio.toISOString().split('T')[0],
    fechaFin: fechaFin.toISOString().split('T')[0],
    salarioBase: salarioBase,
    salarioNoPrestacional: salarioNoPrestacionalTotal,
    cesantias: parseFloat(cesantias.toFixed(2)),
    interesesCesantias: parseFloat(interesesCesantias.toFixed(2)),
    prima: parseFloat(prima.toFixed(2)),
    vacaciones: parseFloat(vacaciones.toFixed(2)),
    indemnizacion: parseFloat(indemnizacion.toFixed(2)),
    total: parseFloat(totalLiquidacion.toFixed(2))
  };

  fetch("https://script.google.com/macros/s/AKfycbz0R7ZfNyq_KgVeQCLx3Q-vgfbCYvanyVZfpI2AsWfXbdKvj9OcR8-hZkXSKIX9Gvv5iQ/exec", {
    method: "POST",
    body: JSON.stringify(datosParaEnviar),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.text())
    .then((data) => console.log("✅ Enviado a Google Sheets:", data))
    .catch((err) => console.error("❌ Error al enviar:", err));
});

function mostrarResultado(html) {
  document.getElementById("resultado").innerHTML = html;
}

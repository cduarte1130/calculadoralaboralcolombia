document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault();

  const motivo = document.getElementById("motivo").value;
  const fechaInicio = new Date(document.getElementById("fechaInicio").value);
  const fechaFin = new Date(document.getElementById("fechaFin").value);
  const salarioBase = parseFloat(document.getElementById("salarioBase").value);
  const salarioNoPrestacional = parseFloat(document.getElementById("salarioNoPrestacional").value);

  if (fechaFin <= fechaInicio) {
    mostrarResultado("⚠️ La fecha de finalización debe ser posterior a la fecha de inicio.");
    return;
  }

  const diasTrabajados = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
  const diasAño = 360;
  const mesesTrabajados = diasTrabajados / 30;

  const añoActual = fechaFin.getFullYear();
  const inicioAno = new Date(añoActual, 0, 1);
  const inicioJul = new Date(añoActual, 6, 1);

  // Cesantías e intereses (solo año en curso hasta la salida)
  const diasCesantias = Math.max(0, Math.ceil((fechaFin - inicioAno) / (1000 * 60 * 60 * 24)));
  const cesantias = (salarioBase * diasCesantias) / diasAño;
  const interesesCesantias = cesantias * 0.12;

  // Prima de servicios (semestre correspondiente)
  let diasPrima = 0;
  if (fechaFin < inicioJul) {
    diasPrima = Math.ceil((fechaFin - inicioAno) / (1000 * 60 * 60 * 24));
  } else {
    diasPrima = Math.ceil((fechaFin - inicioJul) / (1000 * 60 * 60 * 24));
  }
  const prima = (salarioBase * diasPrima) / diasAño;

  // Vacaciones (desde inicio del contrato)
  const vacaciones = (salarioBase * diasTrabajados) / 720;

  // Indemnización si aplica
  let indemnizacion = 0;
  if (motivo === "sin_justa_causa") {
    if (mesesTrabajados < 12) {
      indemnizacion = salarioBase;
    } else {
      indemnizacion = salarioBase + salarioBase * 0.2 * (mesesTrabajados - 12);
    }
  }

  // Salario no prestacional proporcional al mes actual
  const diasMesActual = Math.min(fechaFin.getDate(), 30);
  const salarioNoPrestacionalTotal = (salarioNoPrestacional / 30) * diasMesActual;

  const totalLiquidacion =
    cesantias +
    interesesCesantias +
    prima +
    vacaciones +
    indemnizacion +
    salarioNoPrestacionalTotal;

  mostrarResultado(`
    <table style="margin: 0 auto; border-collapse: collapse;">
      <tr><td><strong>Días trabajados</strong></td><td>${diasTrabajados}</td></tr>
      <tr><td><strong>Cesantías</strong></td><td>${formatearCOP(cesantias)}</td></tr>
      <tr><td><strong>Intereses cesantías</strong></td><td>${formatearCOP(interesesCesantias)}</td></tr>
      <tr><td><strong>Prima de servicios</strong></td><td>${formatearCOP(prima)}</td></tr>
      <tr><td><strong>Vacaciones</strong></td><td>${formatearCOP(vacaciones)}</td></tr>
      <tr><td><strong>Indemnización</strong></td><td>${formatearCOP(indemnizacion)}</td></tr>
      <tr><td><strong>Salario no prestacional del último mes</strong></td><td>${formatearCOP(salarioNoPrestacionalTotal)}</td></tr>
      <tr><td colspan="2"><hr></td></tr>
      <tr><td><strong>Total liquidación</strong></td><td><strong>${formatearCOP(totalLiquidacion)}</strong></td></tr>
    </table>
  `);
});

function formatearCOP(valor) {
  return valor.toLocaleString("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 2
  });
}

function mostrarResultado(html) {
  document.getElementById("resultado").innerHTML = html;
}

document.getElementById("btnLimpiar").addEventListener("click", function () {
  document.getElementById("formulario").reset();
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("motivo").focus();
});

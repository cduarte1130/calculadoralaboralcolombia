document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault();

  const motivo = document.getElementById("motivo").value;
  const fechaInicio = new Date(document.getElementById("fechaInicio").value);
  const fechaFin = new Date(document.getElementById("fechaFin").value);
  const salarioBase = parseFloat(document.getElementById("salarioBase").value);
  const salarioNoPrestacional = parseFloat(document.getElementById("salarioNoPrestacional").value);

  // Validaciones básicas
  if (fechaFin <= fechaInicio) {
    mostrarResultado("La fecha de finalización debe ser posterior a la fecha de inicio.");
    return;
  }

  // Cálculo de días trabajados
  const diasTrabajados = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
  const diasAño = 360; // Base legal para liquidaciones
  const mesesTrabajados = diasTrabajados / 30;

  // Cesantías = (Salario base * días trabajados) / 360
  const cesantias = (salarioBase * diasTrabajados) / diasAño;

  // Intereses a las cesantías = Cesantías * 0.12 * (días trabajados / 360)
  const interesesCesantias = cesantias * 0.12 * (diasTrabajados / diasAño);

  // Prima = (Salario base * días trabajados) / 360
  const prima = (salarioBase * diasTrabajados) / diasAño;

  // Vacaciones = (Salario base * días trabajados) / 720
  const vacaciones = (salarioBase * diasTrabajados) / 720;

  // Indemnización (solo si aplica)
  let indemnizacion = 0;
  if (motivo === "sin_justa_causa") {
    if (mesesTrabajados < 12) {
      indemnizacion = salarioBase * 0.5 * mesesTrabajados; // medio salario por cada mes
    } else {
      indemnizacion = salarioBase + salarioBase * 0.2 * (mesesTrabajados - 12);
    }
  }

  // Total liquidación
  const totalLiquidacion =
    cesantias + interesesCesantias + prima + vacaciones + indemnizacion + (salarioNoPrestacional * mesesTrabajados);

  // Mostrar resultados
  mostrarResultado(`
    <strong>Días trabajados:</strong> ${diasTrabajados} días<br/>
    <strong>Cesantías:</strong> $${cesantias.toFixed(2)}<br/>
    <strong>Intereses cesantías:</strong> $${interesesCesantias.toFixed(2)}<br/>
    <strong>Prima de servicios:</strong> $${prima.toFixed(2)}<br/>
    <strong>Vacaciones:</strong> $${vacaciones.toFixed(2)}<br/>
    <strong>Indemnización:</strong> $${indemnizacion.toFixed(2)}<br/>
    <strong>Salario no prestacional total:</strong> $${(salarioNoPrestacional * mesesTrabajados).toFixed(2)}<br/>
    <hr>
    <strong>Total liquidación:</strong> $${totalLiquidacion.toFixed(2)}
  `);
});

function mostrarResultado(html) {
  document.getElementById("resultado").innerHTML = html;
}

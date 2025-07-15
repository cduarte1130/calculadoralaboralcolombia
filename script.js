document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault();
    const fechaInicio = new Date(document.getElementById("inicio").value);
    const fechaFin = new Date(document.getElementById("fin").value);
    const salarioBase = parseFloat(document.getElementById("salarioBase").value);
    const salarioNoPrestacional = parseFloat(document.getElementById("salarioNoPrestacional").value);
    const motivo = document.getElementById("motivo").value;

    if (isNaN(salarioBase) || isNaN(salarioNoPrestacional)) {
        alert("Por favor ingresa valores numéricos válidos.");
        return;
    }

    if (fechaFin <= fechaInicio) {
        mostrarResultado("⚠️ La fecha de finalización debe ser posterior a la fecha de inicio.");
        return;
    }

    const diasTrabajados = Math.floor((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) + 1;
    const mesesTrabajados = diasTrabajados / 30;

    const anioFin = fechaFin.getFullYear();
    const inicioCesantias = new Date(anioFin, 0, 1);
    const diasCesantias = Math.floor((fechaFin - inicioCesantias) / (1000 * 60 * 60 * 24)) + 1;
    const cesantias = (salarioBase * diasCesantias) / 360;
    const interesesCesantias = cesantias * 0.12 * (diasCesantias / 360);

    const cortePrima = fechaFin.getMonth() < 6 ? new Date(anioFin, 0, 1) : new Date(anioFin, 6, 1);
    const diasPrima = Math.floor((fechaFin - cortePrima) / (1000 * 60 * 60 * 24)) + 1;
    const prima = (salarioBase * diasPrima) / 360;

    const vacaciones = (salarioBase * diasTrabajados) / 720;

    let indemnizacion = 0;
    if (motivo === "sin_justa_causa") {
        if (mesesTrabajados < 12) {
            indemnizacion = salarioBase;
        } else {
            indemnizacion = salarioBase + salarioBase * 0.2 * (mesesTrabajados - 12);
        }
    }

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
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
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

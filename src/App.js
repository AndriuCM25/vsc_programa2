import React, { useState, useMemo } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadialBarChart, RadialBar, PolarAngleAxis
} from "recharts";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState([]);
  const [selectedField, setSelectedField] = useState("TIPO_DE_CUENTA");

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "1234") {
      setLoggedIn(true);
    } else {
      alert("Credenciales incorrectas");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername("");
    setPassword("");
    setData([]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          const processedData = result.data
            .filter(item => item && Object.keys(item).length > 0)
            .map(item => {
              const montoActual = item["MONTO ACTUAL S"] ? 
                parseInt(item["MONTO ACTUAL S"].replace("S/ ", "")) : 0;
              
              const cuantoDebe = item["CUANTO DEBE S"] ? 
                parseInt(item["CUANTO DEBE S"].replace("S/ ", "")) : 0;
              
              return {
                ...item,
                MONTO_ACTUAL_NUM: montoActual,
                CUANTO_DEBE_NUM: cuantoDebe
              };
            });
          setData(processedData);
        },
      });
    }
  };

  const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#F9A602", "#A358DF", "#5CAB7D", "#F25F5C", "#6A0572", "#118AB2", "#06D6A0"];
  const PASTEL_COLORS = ["#A8D5BA", "#F6A6B2", "#A2C7E5", "#FFD6A5", "#CDB4DB", "#FF9AA2", "#B5EAD7", "#C7CEEA", "#F8B195", "#6C5B7B"];

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const totalClientes = data.length;
    const clientesConDeuda = data.filter(item => item.DEUDA === "SI").length;
    const porcentajeDeuda = totalClientes > 0 ? (clientesConDeuda / totalClientes * 100).toFixed(1) : 0;
    
    const montoTotal = data.reduce((sum, item) => sum + (item.MONTO_ACTUAL_NUM || 0), 0);
    const deudaTotal = data.reduce((sum, item) => sum + (item.CUANTO_DEBE_NUM || 0), 0);
    
    // Calcular distribución de tipos de cuenta
    const cuentaCounts = {};
    data.forEach(item => {
      const tipo = item["TIPO DE CUENTA"];
      if (tipo) {
        cuentaCounts[tipo] = (cuentaCounts[tipo] || 0) + 1;
      }
    });
    
    const cuentaMasPopular = Object.entries(cuentaCounts)
      .sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];
    
    // Calcular distribución de distritos
    const distritoCounts = {};
    data.forEach(item => {
      const distrito = item.DISTRITO;
      if (distrito) {
        distritoCounts[distrito] = (distritoCounts[distrito] || 0) + 1;
      }
    });
    
    const distritoMasPopular = Object.entries(distritoCounts)
      .sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];
    
    return {
      totalClientes,
      clientesConDeuda,
      porcentajeDeuda,
      montoTotal,
      deudaTotal,
      cuentaMasPopular: `${cuentaMasPopular[0]} (${((cuentaMasPopular[1] / totalClientes) * 100).toFixed(1)}%)`,
      distritoMasPopular: `${distritoMasPopular[0]} (${((distritoMasPopular[1] / totalClientes) * 100).toFixed(1)}%)`,
      montoPromedio: totalClientes > 0 ? Math.round(montoTotal / totalClientes) : 0,
      deudaPromedio: clientesConDeuda > 0 ? Math.round(deudaTotal / clientesConDeuda) : 0
    };
  }, [data]);

  // Preparar datos para visualización según el campo seleccionado
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    if (selectedField === "TIPO_DE_CUENTA") {
      const counts = {};
      data.forEach(item => {
        const tipo = item["TIPO DE CUENTA"];
        if (tipo) {
          counts[tipo] = (counts[tipo] || 0) + 1;
        }
      });
      
      return Object.keys(counts)
        .filter(key => key && key !== "undefined")
        .map(key => ({
          name: key,
          value: counts[key],
          fill: COLORS[Object.keys(counts).indexOf(key) % COLORS.length]
        }));
    } else if (selectedField === "DISTRITO") {
      const counts = {};
      data.forEach(item => {
        const distrito = item.DISTRITO;
        if (distrito) {
          counts[distrito] = (counts[distrito] || 0) + 1;
        }
      });
      
      return Object.entries(counts)
        .filter(([name]) => name && name !== "undefined")
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value], index) => ({ 
          name, 
          value,
          fill: COLORS[index % COLORS.length]
        }));
    } else if (selectedField === "DEUDA") {
      const counts = {};
      data.forEach(item => {
        const deuda = item.DEUDA;
        if (deuda) {
          counts[deuda] = (counts[deuda] || 0) + 1;
        }
      });
      
      return Object.keys(counts)
        .filter(key => key && key !== "undefined")
        .map(key => ({
          name: key,
          value: counts[key],
          fill: key === "SI" ? "#FF6B6B" : "#4ECDC4"
        }));
    }
    
    return [];
  }, [data, selectedField]);

  // Calcular porcentajes para el gráfico circular
  const totalValue = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const chartDataWithPercentage = useMemo(() => {
    return chartData.map(item => ({
      ...item,
      percentage: ((item.value / totalValue) * 100).toFixed(1)
    }));
  }, [chartData, totalValue]);

  return (
    <div className="d-flex vh-100">
      {!loggedIn ? (
        // LOGIN (sin cambios)
        <div className="container d-flex align-items-center justify-content-center">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="card shadow-lg p-0 overflow-hidden"
            style={{ maxWidth: "900px", width: "100%" }}
          >
            <div className="row g-0">
              <div className="col-md-6 d-flex align-items-center justify-content-center bg-light">
                <img
                  src="/logo_bcp.png"
                  alt="Logo"
                  className="img-fluid p-4"
                  style={{ maxHeight: "300px" }}
                />
              </div>
              <div className="col-md-6 p-4">
                <div className="text-center mb-4">
                  <h4 className="fw-bold">Iniciar Sesión</h4>
                  <p className="text-muted">Accede a tu panel de control</p>
                </div>
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-person-fill me-2"></i>Usuario</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ingrese usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-lock-fill me-2"></i>Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Ingrese contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Ingresar
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        // DASHBOARD
        <div className="d-flex w-100">
          {/* Sidebar blanca */}
          <motion.div
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white text-dark p-3 border-end"
            style={{ width: "250px", minHeight: "100vh" }}
          >
            <h4 className="mb-4 text-center">Banco BCP</h4>
            <div className="mb-3">
              <label className="form-label fw-bold">Seleccionar campo</label>
              <select
                className="form-select"
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
              >
                <option value="TIPO_DE_CUENTA">TIPO DE CUENTA</option>
                <option value="DISTRITO">DISTRITO (Top 8)</option>
                <option value="DEUDA">DEUDA</option>
              </select>
            </div>
            
            <div className="mt-4">
              <h6>Resumen:</h6>
              <p>Total registros: {data.length}</p>
              {data.length > 0 && (
                <>
                  <p>Clientes con deuda: {estadisticas.clientesConDeuda}</p>
                  <p>Monto total: S/ {estadisticas.montoTotal.toLocaleString()}</p>
                </>
              )}
            </div>
            <hr />
            <button className="btn btn-danger w-100" onClick={handleLogout}>
              <i className="bi bi-box-arrow-left"></i> Cerrar sesión
            </button>
          </motion.div>

          {/* Main Content */}
          <div className="flex-grow-1 p-4 overflow-auto bg-light">
            <h2 className="mb-4">Panel de Visualización - Banco BCP</h2>
            <div className="mb-3">
              <label className="form-label">Subir archivo CSV del Banco BCP</label>
              <input type="file" accept=".csv" className="form-control" onChange={handleFileUpload} />
            </div>

            {data.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                {/* Panel de Estadísticas con Iconos */}
                <div className="row mt-4 mb-4">
                  <div className="col-12">
                    <div className="card shadow-sm border-0">
                      <div className="card-body p-4">
                        <h5 className="card-title mb-4 text-primary">
                          <i className="bi bi-bar-chart-fill me-2"></i>
                          Estadísticas del Banco
                        </h5>
                        <div className="row">
                          {/* Total Clientes */}
                          <div className="col-md-3 col-6 mb-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                <i className="bi bi-people-fill text-primary fs-4"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 text-muted">Total Clientes</h6>
                                <h4 className="mb-0 fw-bold">{estadisticas.totalClientes.toLocaleString()}</h4>
                              </div>
                            </div>
                          </div>
                          
                          {/* Clientes con Deuda */}
                          <div className="col-md-3 col-6 mb-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                                <i className="bi bi-exclamation-triangle-fill text-danger fs-4"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 text-muted">Con Deuda</h6>
                                <h4 className="mb-0 fw-bold">{estadisticas.clientesConDeuda.toLocaleString()}</h4>
                                <small className="text-muted">{estadisticas.porcentajeDeuda}% del total</small>
                              </div>
                            </div>
                          </div>
                          
                          {/* Monto Total */}
                          <div className="col-md-3 col-6 mb-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                                <i className="bi bi-currency-exchange text-success fs-4"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 text-muted">Monto Total</h6>
                                <h4 className="mb-0 fw-bold">S/ {estadisticas.montoTotal.toLocaleString()}</h4>
                                <small className="text-muted">Promedio: S/ {estadisticas.montoPromedio.toLocaleString()}</small>
                              </div>
                            </div>
                          </div>
                          
                          {/* Deuda Total */}
                          <div className="col-md-3 col-6 mb-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                                <i className="bi bi-cash-coin text-warning fs-4"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 text-muted">Deuda Total</h6>
                                <h4 className="mb-0 fw-bold">S/ {estadisticas.deudaTotal.toLocaleString()}</h4>
                                <small className="text-muted">Promedio: S/ {estadisticas.deudaPromedio.toLocaleString()}</small>
                              </div>
                            </div>
                          </div>
                          
                          {/* Cuenta Más Popular */}
                          <div className="col-md-4 col-6 mb-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                                <i className="bi bi-credit-card-fill text-info fs-4"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 text-muted">Cuenta Popular</h6>
                                <h6 className="mb-0 fw-bold">{estadisticas.cuentaMasPopular}</h6>
                              </div>
                            </div>
                          </div>
                          
                          {/* Distrito Más Popular */}
                          <div className="col-md-4 col-6 mb-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-purple bg-opacity-10 p-3 rounded-circle me-3">
                                <i className="bi bi-geo-alt-fill text-purple fs-4"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 text-muted">Distrito Popular</h6>
                                <h6 className="mb-0 fw-bold">{estadisticas.distritoMasPopular}</h6>
                              </div>
                            </div>
                          </div>
                          
                          {/* Ratio Deuda/Monto */}
                          <div className="col-md-4 col-6 mb-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-indigo bg-opacity-10 p-3 rounded-circle me-3">
                                <i className="bi bi-graph-up text-indigo fs-4"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 text-muted">Ratio Deuda/Monto</h6>
                                <h6 className="mb-0 fw-bold">
                                  {estadisticas.montoTotal > 0 
                                    ? `${((estadisticas.deudaTotal / estadisticas.montoTotal) * 100).toFixed(1)}%` 
                                    : "0%"}
                                </h6>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gráficos */}
                <div className="row mt-4">
                  {/* Gráfico de Barras */}
                  <div className="col-md-6 mb-4">
                    <div className="card shadow-sm h-100">
                      <div className="card-header bg-primary text-white">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-bar-chart me-2"></i>
                          Gráfico de Barras - {selectedField.replace(/_/g, ' ')}
                        </h5>
                      </div>
                      <div className="card-body">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [value, selectedField.replace(/_/g, ' ')]}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                            <Bar 
                              dataKey="value" 
                              name={selectedField.replace(/_/g, ' ')}
                              radius={[4, 4, 0, 0]}
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico Circular */}
                  <div className="col-md-6 mb-4">
                    <div className="card shadow-sm h-100">
                      <div className="card-header bg-success text-white">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-pie-chart me-2"></i>
                          Gráfico Circular - {selectedField.replace(/_/g, ' ')}
                        </h5>
                      </div>
                      <div className="card-body">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={chartDataWithPercentage}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              innerRadius={60}
                              paddingAngle={2}
                              label={({ name, percentage }) => `${name}: ${percentage}%`}
                              labelLine={false}
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill || PASTEL_COLORS[index % PASTEL_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name, props) => [`${props.payload.percentage}%`, name]}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico de Área */}
                  <div className="col-md-6 mb-4">
                    <div className="card shadow-sm h-100">
                      <div className="card-header bg-info text-white">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-graph-up me-2"></i>
                          Gráfico de Área - {selectedField.replace(/_/g, ' ')}
                        </h5>
                      </div>
                      <div className="card-body">
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [value, selectedField.replace(/_/g, ' ')]}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#8884d8" 
                              fill="#8884d8" 
                              fillOpacity={0.3}
                              activeDot={{ r: 6, fill: '#8884d8' }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico Radial */}
                  <div className="col-md-6 mb-4">
                    <div className="card shadow-sm h-100">
                      <div className="card-header bg-warning text-dark">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-speedometer2 me-2"></i>
                          Gráfico Radial - {selectedField.replace(/_/g, ' ')}
                        </h5>
                      </div>
                      <div className="card-body">
                        <ResponsiveContainer width="100%" height={300}>
                          <RadialBarChart 
                            innerRadius="10%" 
                            outerRadius="100%" 
                            data={chartDataWithPercentage} 
                            startAngle={180} 
                            endAngle={0}
                          >
                            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                            <RadialBar
                              minAngle={15}
                              background
                              clockWise
                              dataKey="value"
                              cornerRadius={10}
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                              ))}
                            </RadialBar>
                            <Tooltip 
                              formatter={(value, name, props) => [`${props.payload.percentage}%`, name]}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                            <Legend 
                              iconSize={10} 
                              layout="vertical" 
                              verticalAlign="middle" 
                              align="right"
                              formatter={(value, entry, index) => (
                                <span style={{ color: '#333', fontSize: '12px' }}>
                                  {value}: {chartDataWithPercentage[index]?.percentage}%
                                </span>
                              )}
                            />
                          </RadialBarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabla de datos */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card shadow-sm">
                      <div className="card-header bg-secondary text-white">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-table me-2"></i>
                          Vista Previa de Datos (primeros 10 registros)
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-striped table-hover">
                            <thead>
                              <tr>
                                {Object.keys(data[0] || {}).filter(key => !key.includes("_NUM")).map(key => (
                                  <th key={key}>{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {data.slice(0, 10).map((item, index) => (
                                <tr key={index}>
                                  {Object.keys(item).filter(key => !key.includes("_NUM")).map(key => (
                                    <td key={key}>{item[key]}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center mt-5">
                <i className="bi bi-graph-up" style={{ fontSize: "3rem", color: "#6c757d" }}></i>
                <p className="text-muted mt-3">Sube un archivo CSV del Banco BCP para visualizar los datos.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
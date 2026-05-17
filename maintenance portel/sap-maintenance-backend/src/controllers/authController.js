/**
 * Auth Controller - POST /api/auth/login
 * Validates employee credentials against SAP LoginSet OData
 */
const sapService = require('../services/sapService');

/**
 * Login Handler
 * Body: { empId: string, password: string }
 */
const login = async (req, res, next) => {
  try {
    const { empId, password } = req.body;

    if (!empId || !password) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID and Password are required.',
      });
    }

    console.log(`\n🔐 Login attempt for Employee ID: ${empId}`);

    const { success, employee, message } = await sapService.authenticateEmployee(
      empId,
      password
    );

    if (!success || !employee) {
      console.log(`  ✗ Login failed for: ${empId} - ${message}`);
      return res.status(401).json({
        success: false,
        error: message || 'Invalid Employee ID or Password.',
      });
    }

    console.log(`  ✓ Login successful for: ${empId}`);

    // Return employee info - Flutter will store this
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        empId: employee.EmpId || empId,
        name: employee.EmpName || employee.Name || 'Employee',
        email: employee.Email || '',
        plant: employee.Plant || employee.Werks || '',
        role: employee.Role || 'Maintenance Engineer',
        department: employee.Department || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login };

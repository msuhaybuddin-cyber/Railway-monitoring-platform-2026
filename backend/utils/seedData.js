const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Equipment = require('../models/Equipment');
const FaultReport = require('../models/FaultReport');
const Maintenance = require('../models/Maintenance');
const Notification = require('../models/Notification');

dotenv.config();

const seedDatabase = async (exitOnComplete = true) => {
  try {
    console.log('🌱 Starting Railway Signaling Platform database seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Equipment.deleteMany();
    await FaultReport.deleteMany();
    await Maintenance.deleteMany();
    await Notification.deleteMany();

    console.log('🧹 Existing data cleared.');

    // 1. Admin User
    const adminUser = await User.create({
      name: 'Chief Signal Engineer R. K. Sharma',
      username: 'admin',
      email: 'admin@railway.gov.in',
      password: 'admin123', // Will be hashed by pre('save') hook
      role: 'admin',
      station: 'Central Signaling HQ - New Delhi',
    });
    console.log('👤 Admin user created (Username: admin | Password: admin123 | Email: admin@railway.gov.in)');

    // 2. 20 Realistic Equipment Records
    const equipmentData = [
      {
        equipmentId: 'SIG-NDLS-101',
        name: 'Platform 1 North Approach 4-Aspect Signal',
        type: 'Railway Signal Lights',
        station: 'New Delhi Central',
        installationDate: new Date('2023-01-15'),
        lastMaintenanceDate: new Date('2026-08-10'),
        nextMaintenanceDate: new Date('2026-11-10'),
        status: 'Working',
        healthPercentage: 98,
        description: 'LED color-light signal with automatic aspect fallback.',
      },
      {
        equipmentId: 'TC-NDLS-204',
        name: 'Track Circuit Section TC-4B Down Main',
        type: 'Track Circuits',
        station: 'New Delhi Central',
        installationDate: new Date('2022-05-12'),
        lastMaintenanceDate: new Date('2026-07-22'),
        nextMaintenanceDate: new Date('2026-10-22'),
        status: 'Working',
        healthPercentage: 92,
        description: 'Audio frequency track circuit monitoring train presence.',
      },
      {
        equipmentId: 'PM-CSMT-301',
        name: 'Crossover 12A Electro-Hydraulic Point Machine',
        type: 'Point Machines',
        station: 'Mumbai CST',
        installationDate: new Date('2021-11-30'),
        lastMaintenanceDate: new Date('2026-06-15'),
        nextMaintenanceDate: new Date('2026-09-15'), // Overdue date
        status: 'Under Maintenance',
        healthPercentage: 62,
        description: 'Dual-control turnout machine for high-speed switch transitions.',
      },
      {
        equipmentId: 'AX-HWH-402',
        name: 'Yard Entry High-Sensitivity Axle Counter',
        type: 'Axle Counters',
        station: 'Howrah Junction',
        installationDate: new Date('2023-03-20'),
        lastMaintenanceDate: new Date('2026-09-01'),
        nextMaintenanceDate: new Date('2026-12-01'),
        status: 'Working',
        healthPercentage: 96,
        description: 'Multi-section digital axle counter for block section clearance.',
      },
      {
        equipmentId: 'SCU-MAS-505',
        name: 'Terminal Route Relay Signal Control Unit',
        type: 'Signal Control Units',
        station: 'Chennai Central',
        installationDate: new Date('2020-08-14'),
        lastMaintenanceDate: new Date('2026-08-28'),
        nextMaintenanceDate: new Date('2026-11-28'),
        status: 'Working',
        healthPercentage: 89,
        description: 'Microprocessor-based signal interlocking and routing processor.',
      },
      {
        equipmentId: 'IXL-SBC-601',
        name: 'Solid State Electronic Interlocking Subsystem',
        type: 'Interlocking Systems',
        station: 'Bangalore City',
        installationDate: new Date('2022-09-05'),
        lastMaintenanceDate: new Date('2026-09-10'),
        nextMaintenanceDate: new Date('2026-12-10'),
        status: 'Working',
        healthPercentage: 99,
        description: 'Fail-safe 2-out-of-2 hardware architecture interlocking unit.',
      },
      {
        equipmentId: 'SIG-CSMT-108',
        name: 'Down Fast Line Distant Signal Post D-3',
        type: 'Railway Signal Lights',
        station: 'Mumbai CST',
        installationDate: new Date('2023-04-18'),
        lastMaintenanceDate: new Date('2026-07-01'),
        nextMaintenanceDate: new Date('2026-09-30'), // Overdue
        status: 'Faulty',
        healthPercentage: 20,
        description: 'Amber warning lamp current sensor threshold failure.',
      },
      {
        equipmentId: 'TC-HWH-210',
        name: 'East Yard Shunting Track Circuit TC-9',
        type: 'Track Circuits',
        station: 'Howrah Junction',
        installationDate: new Date('2021-04-10'),
        lastMaintenanceDate: new Date('2026-08-15'),
        nextMaintenanceDate: new Date('2026-11-15'),
        status: 'Working',
        healthPercentage: 94,
        description: 'DC track relay circuit with surge lightning arrestors.',
      },
      {
        equipmentId: 'PM-NDLS-305',
        name: 'Terminal Bay Turnout Point Machine PM-08',
        type: 'Point Machines',
        station: 'New Delhi Central',
        installationDate: new Date('2022-01-22'),
        lastMaintenanceDate: new Date('2026-09-18'),
        nextMaintenanceDate: new Date('2026-12-18'),
        status: 'Working',
        healthPercentage: 95,
        description: 'Standard 1435mm gauge turnout motor with lock detection.',
      },
      {
        equipmentId: 'AX-ADI-409',
        name: 'Platform Loop Digital Axle Counter Head',
        type: 'Axle Counters',
        station: 'Ahmedabad Junction',
        installationDate: new Date('2023-06-11'),
        lastMaintenanceDate: new Date('2026-08-05'),
        nextMaintenanceDate: new Date('2026-11-05'),
        status: 'Working',
        healthPercentage: 91,
        description: 'Wheel detection sensor with telegram transmission bus.',
      },
      {
        equipmentId: 'SCU-SC-512',
        name: 'Secunderabad Outer Junction Control Gateway',
        type: 'Signal Control Units',
        station: 'Secunderabad Junction',
        installationDate: new Date('2021-10-09'),
        lastMaintenanceDate: new Date('2026-06-20'),
        nextMaintenanceDate: new Date('2026-09-20'), // Overdue
        status: 'Faulty',
        healthPercentage: 18,
        description: 'Main communication bus interface experienced packet loss.',
      },
      {
        equipmentId: 'IXL-NDLS-605',
        name: 'Delhi Junction Central Interlocking Rack IX-1',
        type: 'Interlocking Systems',
        station: 'New Delhi Central',
        installationDate: new Date('2020-03-15'),
        lastMaintenanceDate: new Date('2026-09-25'),
        nextMaintenanceDate: new Date('2026-12-25'),
        status: 'Working',
        healthPercentage: 97,
        description: 'Central interlocking controller with hot-standby redundancy.',
      },
      {
        equipmentId: 'SIG-MAS-112',
        name: 'Platform 4 Starter LED Signal',
        type: 'Railway Signal Lights',
        station: 'Chennai Central',
        installationDate: new Date('2022-12-01'),
        lastMaintenanceDate: new Date('2026-08-19'),
        nextMaintenanceDate: new Date('2026-11-19'),
        status: 'Working',
        healthPercentage: 94,
        description: 'Multi-aspect starter signal with route indicator screen.',
      },
      {
        equipmentId: 'TC-SBC-215',
        name: 'West Approach Crossover Track Circuit TC-12',
        type: 'Track Circuits',
        station: 'Bangalore City',
        installationDate: new Date('2023-02-14'),
        lastMaintenanceDate: new Date('2026-05-15'),
        nextMaintenanceDate: new Date('2026-08-15'), // Overdue
        status: 'Under Maintenance',
        healthPercentage: 58,
        description: 'Insulated rail joint replacement and impedance bond test.',
      },
      {
        equipmentId: 'PM-HWH-309',
        name: 'Main Line Junction Point Machine PM-21',
        type: 'Point Machines',
        station: 'Howrah Junction',
        installationDate: new Date('2021-07-28'),
        lastMaintenanceDate: new Date('2026-09-02'),
        nextMaintenanceDate: new Date('2026-12-02'),
        status: 'Working',
        healthPercentage: 93,
        description: 'Rotary action point machine with internal circuit breaker.',
      },
      {
        equipmentId: 'AX-NDLS-415',
        name: 'East Yard Sorting Siding Axle Sensor',
        type: 'Axle Counters',
        station: 'New Delhi Central',
        installationDate: new Date('2022-07-19'),
        lastMaintenanceDate: new Date('2026-09-12'),
        nextMaintenanceDate: new Date('2026-12-12'),
        status: 'Working',
        healthPercentage: 96,
        description: 'High-speed wheel flange counter for marshaling tracks.',
      },
      {
        equipmentId: 'SCU-CSMT-518',
        name: 'Harbour Line Signal Controller Interface',
        type: 'Signal Control Units',
        station: 'Mumbai CST',
        installationDate: new Date('2022-04-16'),
        lastMaintenanceDate: new Date('2026-08-20'),
        nextMaintenanceDate: new Date('2026-11-20'),
        status: 'Working',
        healthPercentage: 90,
        description: 'Suburban train dispatch controller rack.',
      },
      {
        equipmentId: 'IXL-MAS-608',
        name: 'Terminal Interlocking Electronic Logic Unit',
        type: 'Interlocking Systems',
        station: 'Chennai Central',
        installationDate: new Date('2021-09-30'),
        lastMaintenanceDate: new Date('2026-08-01'),
        nextMaintenanceDate: new Date('2026-11-01'),
        status: 'Working',
        healthPercentage: 95,
        description: 'Microcomputer interlocking module for complex route setting.',
      },
      {
        equipmentId: 'SIG-ADI-120',
        name: 'Up Line Home Signal HS-02 with Calling-On',
        type: 'Railway Signal Lights',
        station: 'Ahmedabad Junction',
        installationDate: new Date('2023-05-25'),
        lastMaintenanceDate: new Date('2026-09-15'),
        nextMaintenanceDate: new Date('2026-12-15'),
        status: 'Working',
        healthPercentage: 97,
        description: 'Four-aspect main home signal with subsidiary calling-on lamp.',
      },
      {
        equipmentId: 'TC-SC-225',
        name: 'Interlocking Approach Track Circuit TC-7A',
        type: 'Track Circuits',
        station: 'Secunderabad Junction',
        installationDate: new Date('2021-03-10'),
        lastMaintenanceDate: new Date('2026-07-14'),
        nextMaintenanceDate: new Date('2026-10-14'),
        status: 'Faulty',
        healthPercentage: 25,
        description: 'Track ballast resistance drop caused false occupancy reading.',
      },
    ];

    const createdEquipment = await Equipment.insertMany(equipmentData);
    console.log(`📡 Inserted ${createdEquipment.length} Railway Signaling Equipment records.`);

    // 3. 8 Realistic Fault Reports
    const faultReportsData = [
      {
        faultId: 'FLT-2026-0001',
        equipmentId: 'SIG-CSMT-108',
        equipmentName: 'Down Fast Line Distant Signal Post D-3',
        station: 'Mumbai CST',
        description: 'Amber warning lamp current sensor threshold triggered red alert during night inspection.',
        severity: 'High',
        reportedAt: new Date('2026-10-08T08:30:00Z'),
        reportedBy: 'Signal Inspector Rajesh Verma',
        status: 'Open',
      },
      {
        faultId: 'FLT-2026-0002',
        equipmentId: 'SCU-SC-512',
        equipmentName: 'Secunderabad Outer Junction Control Gateway',
        station: 'Secunderabad Junction',
        description: 'Intermittent optical transceiver link down on channel B causing gateway sync errors.',
        severity: 'Critical',
        reportedAt: new Date('2026-10-09T14:15:00Z'),
        reportedBy: 'Station Controller A. N. Rao',
        status: 'In Progress',
      },
      {
        faultId: 'FLT-2026-0003',
        equipmentId: 'TC-SC-225',
        equipmentName: 'Interlocking Approach Track Circuit TC-7A',
        station: 'Secunderabad Junction',
        description: 'False rail track occupancy reported due to ballast waterlogging near point 14.',
        severity: 'Critical',
        reportedAt: new Date('2026-10-10T11:00:00Z'),
        reportedBy: 'Track Supervisor K. Reddy',
        status: 'Open',
      },
      {
        faultId: 'FLT-2026-0004',
        equipmentId: 'PM-CSMT-301',
        equipmentName: 'Crossover 12A Electro-Hydraulic Point Machine',
        station: 'Mumbai CST',
        description: 'Switch point obstacle detection sensor throwing intermittent warning.',
        severity: 'Medium',
        reportedAt: new Date('2026-10-05T09:45:00Z'),
        reportedBy: 'Technician Sunil Patil',
        status: 'In Progress',
      },
      {
        faultId: 'FLT-2026-0005',
        equipmentId: 'TC-SBC-215',
        equipmentName: 'West Approach Crossover Track Circuit TC-12',
        station: 'Bangalore City',
        description: 'Insulated rail joint bonding wire wear detected during routine patrol.',
        severity: 'Low',
        reportedAt: new Date('2026-09-28T16:20:00Z'),
        reportedBy: 'Permanent Way Inspector Gowda',
        status: 'Resolved',
        resolvedAt: new Date('2026-09-30T10:00:00Z'),
        resolutionNotes: 'Bonding cable spliced and resistance restored to 4.2 ohms.',
      },
      {
        faultId: 'FLT-2026-0006',
        equipmentId: 'SIG-NDLS-101',
        equipmentName: 'Platform 1 North Approach 4-Aspect Signal',
        station: 'New Delhi Central',
        description: 'Minor LED cluster flicker observed on green aspect lamp during voltage transition.',
        severity: 'Low',
        reportedAt: new Date('2026-08-14T07:10:00Z'),
        reportedBy: 'Signal Maintainer Ashok Kumar',
        status: 'Resolved',
        resolvedAt: new Date('2026-08-15T12:00:00Z'),
        resolutionNotes: 'Regulated DC power supply capacitor bank replaced.',
      },
      {
        faultId: 'FLT-2026-0007',
        equipmentId: 'AX-HWH-402',
        equipmentName: 'Yard Entry High-Sensitivity Axle Counter',
        station: 'Howrah Junction',
        description: 'Sensor rail clamp bolt loosened slightly due to heavy freight vibration.',
        severity: 'Medium',
        reportedAt: new Date('2026-09-02T13:40:00Z'),
        reportedBy: 'Section Engineer Mukherjee',
        status: 'Resolved',
        resolvedAt: new Date('2026-09-03T11:30:00Z'),
        resolutionNotes: 'Torque tightened to 120 Nm with thread locking adhesive.',
      },
      {
        faultId: 'FLT-2026-0008',
        equipmentId: 'IXL-NDLS-605',
        equipmentName: 'Delhi Junction Central Interlocking Rack IX-1',
        station: 'New Delhi Central',
        description: 'Fan cooling unit alert in secondary processor cabinet.',
        severity: 'Low',
        reportedAt: new Date('2026-07-19T10:05:00Z'),
        reportedBy: 'Systems Technician Priya Mishra',
        status: 'Resolved',
        resolvedAt: new Date('2026-07-20T15:00:00Z'),
        resolutionNotes: 'Cooling fan swapped and air filter cartridge vacuum cleaned.',
      },
    ];

    const createdFaults = await FaultReport.insertMany(faultReportsData);
    console.log(`⚠️ Inserted ${createdFaults.length} Fault Reports.`);

    // 4. 10 Realistic Maintenance Records
    const maintenanceData = [
      {
        maintenanceId: 'MNT-2026-0001',
        equipmentId: 'PM-CSMT-301',
        equipmentName: 'Crossover 12A Electro-Hydraulic Point Machine',
        station: 'Mumbai CST',
        maintenanceType: 'Point Machine Lubrication',
        scheduledDate: new Date('2026-09-15'), // Overdue
        technicianName: 'Technician Sunil Patil',
        description: 'Quarterly gear overhaul, grease lubrication and switch locking clearance calibration.',
        status: 'Overdue',
        remarks: 'Partially delayed due to night mega block rescheduling.',
      },
      {
        maintenanceId: 'MNT-2026-0002',
        equipmentId: 'SIG-CSMT-108',
        equipmentName: 'Down Fast Line Distant Signal Post D-3',
        station: 'Mumbai CST',
        maintenanceType: 'Signal Calibration',
        scheduledDate: new Date('2026-09-30'), // Overdue
        technicianName: 'Signal Engineer V. K. Nair',
        description: 'Complete optical alignment, current transformer replacement and aspect test.',
        status: 'Overdue',
        remarks: 'Work order raised to coordinate with FLT-2026-0001 resolution.',
      },
      {
        maintenanceId: 'MNT-2026-0003',
        equipmentId: 'TC-SBC-215',
        equipmentName: 'West Approach Crossover Track Circuit TC-12',
        station: 'Bangalore City',
        maintenanceType: 'Track Circuit Test',
        scheduledDate: new Date('2026-10-15'), // Upcoming
        technicianName: 'Senior Technician M. Ramesh',
        description: 'Track relay ballast resistance check, shunt sensitivity test and bond inspection.',
        status: 'Scheduled',
        remarks: 'Scheduled during morning non-peak track possession.',
      },
      {
        maintenanceId: 'MNT-2026-0004',
        equipmentId: 'SCU-SC-512',
        equipmentName: 'Secunderabad Outer Junction Control Gateway',
        station: 'Secunderabad Junction',
        maintenanceType: 'Emergency Repair',
        scheduledDate: new Date('2026-10-14'),
        technicianName: 'Electronics Specialist Anita Roy',
        description: 'Swap faulty fiber optic transceivers and verify loopback integrity.',
        status: 'In Progress',
        remarks: 'Diagnostic test ongoing on bay 3.',
      },
      {
        maintenanceId: 'MNT-2026-0005',
        equipmentId: 'SIG-NDLS-101',
        equipmentName: 'Platform 1 North Approach 4-Aspect Signal',
        station: 'New Delhi Central',
        maintenanceType: 'Routine Inspection',
        scheduledDate: new Date('2026-11-10'),
        technicianName: 'Signal Maintainer Ashok Kumar',
        description: 'Monthly visual lamp inspection, cable insulation test and housing seal check.',
        status: 'Scheduled',
      },
      {
        maintenanceId: 'MNT-2026-0006',
        equipmentId: 'AX-HWH-402',
        equipmentName: 'Yard Entry High-Sensitivity Axle Counter',
        station: 'Howrah Junction',
        maintenanceType: 'Preventive Overhaul',
        scheduledDate: new Date('2026-12-01'),
        technicianName: 'Section Engineer Mukherjee',
        description: 'Half-yearly electronic evaluation unit testing and counting head recalibration.',
        status: 'Scheduled',
      },
      {
        maintenanceId: 'MNT-2026-0007',
        equipmentId: 'IXL-SBC-601',
        equipmentName: 'Solid State Electronic Interlocking Subsystem',
        station: 'Bangalore City',
        maintenanceType: 'Routine Inspection',
        scheduledDate: new Date('2026-09-10'),
        completedDate: new Date('2026-09-10'),
        technicianName: 'Inspector David Fernandez',
        description: 'Executive software diagnostic scan, event logger backup and standby switchover.',
        status: 'Completed',
        remarks: 'System passed SIL-4 self-tests with zero anomalies.',
      },
      {
        maintenanceId: 'MNT-2026-0008',
        equipmentId: 'PM-NDLS-305',
        equipmentName: 'Terminal Bay Turnout Point Machine PM-08',
        station: 'New Delhi Central',
        maintenanceType: 'Point Machine Lubrication',
        scheduledDate: new Date('2026-09-18'),
        completedDate: new Date('2026-09-18'),
        technicianName: 'Maintainer Devendra Singh',
        description: 'Friction clutch adjustment, lubricating rack and checking stroke travel.',
        status: 'Completed',
        remarks: 'Clutch torque calibrated to 450 kg-m per railway specifications.',
      },
      {
        maintenanceId: 'MNT-2026-0009',
        equipmentId: 'TC-NDLS-204',
        equipmentName: 'Track Circuit Section TC-4B Down Main',
        station: 'New Delhi Central',
        maintenanceType: 'Track Circuit Test',
        scheduledDate: new Date('2026-07-22'),
        completedDate: new Date('2026-07-22'),
        technicianName: 'Maintainer Devendra Singh',
        description: 'Relay pick-up and drop voltage measurement under varied weather parameters.',
        status: 'Completed',
        remarks: 'Drop-shunt sensitivity 0.5 ohm verified.',
      },
      {
        maintenanceId: 'MNT-2026-0010',
        equipmentId: 'SCU-MAS-505',
        equipmentName: 'Terminal Route Relay Signal Control Unit',
        station: 'Chennai Central',
        maintenanceType: 'Routine Inspection',
        scheduledDate: new Date('2026-08-28'),
        completedDate: new Date('2026-08-28'),
        technicianName: 'Lead Engineer K. Swaminathan',
        description: 'Terminal block wiring check, relay contact cleaning and ground fault check.',
        status: 'Completed',
        remarks: 'Ground insulation measured >10 Megaohms.',
      },
    ];

    const createdMaintenance = await Maintenance.insertMany(maintenanceData);
    console.log(`🔧 Inserted ${createdMaintenance.length} Maintenance records.`);

    // 5. In-App Notifications
    const notificationData = [
      {
        title: 'Critical Fault Reported: FLT-2026-0003',
        message: 'Critical false rail track occupancy reported on TC-SC-225 at Secunderabad Junction.',
        type: 'fault_reported',
        severity: 'critical',
        referenceId: 'FLT-2026-0003',
        isRead: false,
      },
      {
        title: 'Maintenance Overdue Alert',
        message: 'Point Machine Lubrication for PM-CSMT-301 at Mumbai CST is overdue since Sept 15, 2026.',
        type: 'maintenance_overdue',
        severity: 'high',
        referenceId: 'MNT-2026-0001',
        isRead: false,
      },
      {
        title: 'Maintenance Due Soon',
        message: 'Track Circuit Test for TC-SBC-215 scheduled on Oct 15, 2026 at Bangalore City.',
        type: 'maintenance_due',
        severity: 'info',
        referenceId: 'MNT-2026-0003',
        isRead: false,
      },
      {
        title: 'Fault Successfully Resolved',
        message: 'Fault FLT-2026-0005 on TC-SBC-215 at Bangalore City has been resolved by PWI Gowda.',
        type: 'fault_resolved',
        severity: 'success',
        referenceId: 'FLT-2026-0005',
        isRead: true,
      },
    ];

    await Notification.insertMany(notificationData);
    console.log(`🔔 Inserted ${notificationData.length} initial Notifications.`);

    console.log('🎉 Database seeding completed successfully!');
    if (exitOnComplete) {
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Error during database seeding:', err);
    if (exitOnComplete) {
      process.exit(1);
    }
  }
};

// If run directly via command line
if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB().then(() => {
    seedDatabase(true);
  });
}

module.exports = { seedDatabase };

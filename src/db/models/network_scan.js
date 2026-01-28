import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class NetworkScan extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    netScanCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'net_scan_code'
    },
    netScanDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'net_scan_date'
    },
    netScanIpAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'net_scan_ip_address'
    },
    netScanMac: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'net_scan_mac'
    },
    netScanSnmpIsOn: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'net_scan_snmp_is_on'
    },
    netScanHasClientApp: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'net_scan_has_client_app'
    },
    netScanHostname: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'net_scan_hostname'
    },
    netScanOperatingSystem: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'net_scan_operating_system'
    },
    netScanDevicesType: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'net_scan_devices_type'
    },
    netScanInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'net_scan_info'
    },
    netDevicesIsOk: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'net_devices_is_ok'
    }
  }, {
    sequelize,
    tableName: 'network_scan',
    schema: 'gri',
    timestamps: false,
    indexes: [
      {
        name: "network_scan_net_scan_mac_idx",
        fields: [
          { name: "net_scan_mac" },
        ]
      },
      {
        name: "network_scan_pk",
        unique: true,
        fields: [
          { name: "net_scan_code" },
        ]
      },
      {
        name: "pk_network_scan",
        unique: true,
        fields: [
          { name: "net_scan_code" },
        ]
      },
    ]
  });
  }
}

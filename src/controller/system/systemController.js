import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

const getCpuUsage = async () => {
	const { stdout } = await execAsync(
		"top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1",
	);
	return { cpuUsage: parseFloat(stdout.trim()) };
};

const getMemoryInfo = async () => {
	const { stdout } = await execAsync(
		'free -m | awk \'NR==2{printf "%.2f", $3*100/$2}\'',
	);
	const { stdout: memDetails } = await execAsync(
		'free -m | awk \'NR==2{printf "%s/%s", $3,$2}\'',
	);
	const [used, total] = memDetails.split('/');
	return {
		memoryUsage: parseFloat(stdout.trim()),
		memoryUsed: `${used}MB`,
		memoryTotal: `${total}MB`,
	};
};

const getDiskInfo = async () => {
	const { stdout } = await execAsync(
		"df -h / | awk 'NR==2{print $5}' | cut -d'%' -f1",
	);
	const { stdout: diskDetails } = await execAsync(
		'df -h / | awk \'NR==2{printf "%s/%s", $3,$2}\'',
	);
	const [used, total] = diskDetails.split('/');
	return {
		diskUsage: parseInt(stdout.trim()),
		diskUsed: used,
		diskTotal: total,
	};
};

const getUptime = async () => {
	const { stdout } = await execAsync("uptime -p | sed 's/up //'");
	return stdout.trim();
};

const getUsers = async () => {
	const { stdout } = await execAsync('who | wc -l');
	return parseInt(stdout.trim());
};

export const getSystemInfo = async (req, res) => {
	try {
		const [cpu, memory, disk, uptime, users] = await Promise.all([
			getCpuUsage(),
			getMemoryInfo(),
			getDiskInfo(),
			getUptime(),
			getUsers(),
		]);

		res.json({
			hostname: os.hostname(),
			platform: os.platform(),
			arch: os.arch(),
			cpus: os.cpus().length,
			cpuModel: os.cpus()[0].model,
			...cpu,
			...memory,
			...disk,
			uptime,
			connectedUsers: users,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

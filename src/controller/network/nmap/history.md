sudo setcap 'cap_net_bind_service=ep' file_name

Setting multiple capabilities on a file

sudo setcap 'cap_net_bind_service=ep cap_sys_admin=ep' file_name

Removing all capabilities from a file

sudo setcap -r file_name

Checking capabilities for a file

getcap file_name

List of possible capabilities (some are really interesting)

https://linux.die.net/man/7/capabilities

Pitfall: setting capabilities does not really work for scripts. If you want your Python script to work, you need to set the capabilities on the Python executable itself. It's not ideal.

Note: setcap always overwrites the entire capability set when you run it. Most of the time, you see examples using setcap with + or - syntax, which I believe is a confusing piece of junk and does NOT work as you would expect from other tools like chmod. You can't use setcap multiple times to add different capabilities, it needs to be done in a single command.

CAP_NET_RAW
              •  Use RAW and PACKET sockets;
              •  bind to any address for transparent proxying.

whereis arp-scan
arp-scan: /usr/sbin/arp-scan /usr/share/arp-scan /usr/share/man/man1/arp-scan.1.gz

sudo setcap 'cap_net_raw=ep' /usr/sbin/arp-scan ;
sudo setcap 'cap_net_raw=ep' /usr/share/arp-scan ;
getcap /usr/sbin/arp-scan
getcap /usr/share/arp-scan

$ whereis nmap
nmap: /usr/bin/nmap /usr/share/nmap /usr/share/man/man1/nmap.1.gz
sudo setcap 'cap_net_raw=ep' /usr/bin/nmap
getcap /usr/bin/nmap


remove all data in arp table;
for e in $(arp -a | sed -n 's/.*(\([^()]*\)).*/\1/p'); do arp -d $e; done

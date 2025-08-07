# SiteLSN

### É necessário baixar a pasta .ssh pois contém a chave pública de ssh, que permite a transferência da página
### Precisará usar openVPN para acessar o Departamento de Física da UFC, se estiver fora dele
Minhas credenciais do VPN:
usuário: leticia
passphase: le08fr07
### Utilize esse passo a passo para atualizar a página
### Bash
sftp lsn@www.fisica.ufc.br \\
sftp> cd /home/lsn/ \\
sftp> lcd "/home/leticia/Site LSN" \\
sftp> put -r * \\
sftp> exit \\




Link para o site:
https://www.fisica.ufc.br/lsn


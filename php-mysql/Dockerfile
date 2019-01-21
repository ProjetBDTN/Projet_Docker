FROM debian

RUN apt-get update && apt-get install -y apache2 \
    && apt-get install -y libapache2-mod-php7.0 \
    && apt-get install -y php7.0-mysql

EXPOSE 80

ENTRYPOINT [ "/usr/sbin/apache2ctl", "-D", "FOREGOUND" ]
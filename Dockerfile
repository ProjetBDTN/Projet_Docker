FROM debian

RUN apt-get update && apt-get install -y apache2
RUN apt-get install -y libapache2-mod-php7.0
RUN apt-get install -y php7.0-dev
RUN apt-get install -y libcurl3-openssl-dev
RUN apt-get install -y pkg-config
RUN pecl install pecl_http
RUN pecl install mongodb
RUN echo "extension=mongodb.so" >> /etc/php/7.0/apache2/php.ini

EXPOSE 80

CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
import { motion } from "framer-motion";
import { events } from "@/lib/data";

export default function EventsSection() {
  return (
    <section id="events" className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">Events & Meetups</h2>
          <p className="mt-4 text-lg text-neutral-600">Join me at upcoming events to learn and connect with the community</p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-100 hover:shadow-md transition-shadow group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="p-6 flex items-start gap-4">
                <div className="flex-shrink-0 w-16 text-center">
                  <span className="block text-xl font-bold text-primary-600">{event.day}</span>
                  <span className="block text-sm text-neutral-600">{event.month}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-neutral-900">{event.title}</h3>
                  <p className="text-neutral-600 mt-2">{event.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="flex items-center text-sm text-neutral-600">
                      <i className="fas fa-clock mr-2 text-neutral-400"></i>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <i className={`fas fa-${event.isOnline ? 'globe' : 'map-marker-alt'} mr-2 text-neutral-400`}></i>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a 
                      href={event.actionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 border border-primary-600 rounded-md text-sm font-medium text-primary-600 bg-white hover:bg-primary-50 transition-colors"
                    >
                      {event.actionText}
                      <i className={`fas fa-${event.isOnline ? 'bell' : 'arrow-right'} ml-1.5 group-hover:translate-x-0.5 transition-transform`}></i>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a 
            href="#"
            className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            View All Events
            <i className="fas fa-calendar-alt ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
}

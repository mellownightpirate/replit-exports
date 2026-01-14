import { motion } from "framer-motion";

export default function NowSection() {
  const currentlyLearning = [
    "Advanced Large Language Model techniques and optimizations",
    "Real-time data processing with Apache Kafka and Flink",
    "Ethical AI implementation and governance frameworks"
  ];

  const currentlyBuilding = [
    "A comprehensive course on data integration best practices for enterprise environments",
    "Open-source tool for visualizing ML model performance across different scenarios"
  ];

  const currentlyReading = [
    '"Designing Machine Learning Systems" by Chip Huyen',
    '"Becoming a Technical Leader" by Gerald M. Weinberg'
  ];

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 text-center">What I'm Doing Now</h2>
          <p className="mt-4 text-lg text-neutral-600 text-center">Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

          <div className="mt-8 grid gap-6">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-primary-600 mb-3">Currently Learning</h3>
              <ul className="space-y-2 text-neutral-700">
                {currentlyLearning.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-book-open mt-1 mr-3 text-primary-500"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3 className="text-xl font-semibold text-primary-600 mb-3">Currently Building</h3>
              <ul className="space-y-2 text-neutral-700">
                {currentlyBuilding.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-hammer mt-1 mr-3 text-primary-500"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-primary-600 mb-3">Currently Reading</h3>
              <ul className="space-y-2 text-neutral-700">
                {currentlyReading.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-book mt-1 mr-3 text-primary-500"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
